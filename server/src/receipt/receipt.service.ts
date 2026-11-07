import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateReceiptDto } from './dto/create-receipt.dto'
import { AddReceiptItemDto } from './dto/add-receipt-item.dto'
import { UpdateReceiptDto } from './dto/update-receipt.dto'
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto'
import { ReceiptStatus, MovementType } from '../generated/prisma/client'

const INCLUDE = {
  warehouse: true,
  createdBy: { select: { id: true, email: true, firstName: true, lastName: true, username: true } },
  items: {
    include: {
      product: {
        include: {
          baseUnit: true,
          purchaseUnit: true,
          saleUnit: true,
          category: true,
          manufacturer: true,
        },
        omit: { imageData: true },
      },
      unit: true,
    },
    orderBy: { id: 'asc' as const },
  },
}

const PRODUCT_FIELDS = {
  id: true,
  title: true,
  sku: true,
  baseUnitId: true,
  purchaseUnitId: true,
  purchaseToBase: true,
  saleUnitId: true,
  saleToBase: true,
  purchasePrice: true,
  estimatePrice: true,
  salePrice: true,
}

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string) {
    const where: any = {}
    if (status) where.status = status
    return this.prisma.goodsReceipt.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    const receipt = await this.prisma.goodsReceipt.findUnique({ where: { id }, include: INCLUDE })
    if (!receipt) {
      throw new NotFoundException('Поступление не найдено')
    }
    return receipt
  }

  async create(dto: CreateReceiptDto, userId?: string) {
    await this.ensureWarehouse(dto.warehouseId)

    const number = await this.generateNumber()
    const receipt = await this.prisma.goodsReceipt.create({
      data: {
        number,
        warehouseId: dto.warehouseId,
        supplier: dto.supplier,
        comment: dto.comment,
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : new Date(),
        createdById: userId,
      },
    })

    if (dto.items?.length) {
      for (const item of dto.items) {
        await this.addItem(receipt.id, item)
      }
    }

    return this.findById(receipt.id)
  }

  async update(id: string, dto: UpdateReceiptDto) {
    const receipt = await this.findById(id)
    this.assertDraft(receipt.status)

    if (dto.warehouseId) {
      await this.ensureWarehouse(dto.warehouseId)
    }

    return this.prisma.goodsReceipt.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        supplier: dto.supplier,
        comment: dto.comment,
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : undefined,
      },
      include: INCLUDE,
    })
  }

  /** Добавляет строку к черновику. Повторное добавление того же товара — увеличивает количество. */
  async addItem(id: string, dto: AddReceiptItemDto) {
    const receipt = await this.prisma.goodsReceipt.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!receipt) throw new NotFoundException('Поступление не найдено')
    this.assertDraft(receipt.status)

    const product = await this.loadProduct(dto.productId)
    const resolved = this.resolveItem(product, dto)

    const existing = receipt.items.find((i) => i.productId === dto.productId)
    if (existing) {
      return this.prisma.goodsReceiptItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + resolved.quantity,
          unitQuantity: existing.unitQuantity + resolved.unitQuantity,
          unitId: resolved.unitId,
          unitFactor: resolved.unitFactor,
          purchasePrice: dto.purchasePrice ?? existing.purchasePrice,
        },
      })
    }

    await this.prisma.goodsReceiptItem.create({
      data: {
        receiptId: id,
        productId: dto.productId,
        quantity: resolved.quantity,
        unitId: resolved.unitId,
        unitQuantity: resolved.unitQuantity,
        unitFactor: resolved.unitFactor,
        purchasePrice: dto.purchasePrice,
      },
    })

    return this.findById(id)
  }

  async updateItem(id: string, itemId: string, dto: UpdateReceiptItemDto) {
    const receipt = await this.findById(id)
    this.assertDraft(receipt.status)

    const item = await this.prisma.goodsReceiptItem.findUnique({ where: { id: itemId } })
    if (!item || item.receiptId !== id) {
      throw new NotFoundException('Строка поступления не найдена')
    }

    const product = await this.loadProduct(item.productId)
    const unitId = dto.unitId ?? item.unitId
    const unitQuantity = dto.quantity ?? item.unitQuantity
    const factor = this.factorForUnit(product, unitId)

    await this.prisma.goodsReceiptItem.update({
      where: { id: itemId },
      data: {
        unitId,
        unitQuantity,
        unitFactor: factor,
        quantity: unitQuantity * factor,
        purchasePrice: dto.purchasePrice !== undefined ? dto.purchasePrice : item.purchasePrice,
      },
    })

    return this.findById(id)
  }

  async removeItem(id: string, itemId: string) {
    const receipt = await this.findById(id)
    this.assertDraft(receipt.status)

    const item = await this.prisma.goodsReceiptItem.findUnique({ where: { id: itemId } })
    if (!item || item.receiptId !== id) {
      throw new NotFoundException('Строка поступления не найдена')
    }

    await this.prisma.goodsReceiptItem.delete({ where: { id: itemId } })
    return this.findById(id)
  }

  /** Проводит поступление: приходует товар на склад. */
  async post(id: string, userId?: string) {
    const receipt = await this.findById(id)
    if (receipt.status === 'POSTED') return receipt
    if (receipt.status === 'CANCELLED') {
      throw new BadRequestException('Отменённое поступление нельзя провести')
    }
    if (receipt.items.length === 0) {
      throw new BadRequestException('Добавьте хотя бы одну позицию перед проведением')
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of receipt.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        const pricePerBase =
          item.purchasePrice != null
            ? item.purchasePrice / item.unitFactor
            : (product?.purchasePrice ?? null)

        const existing = await tx.stockItem.findUnique({
          where: {
            productId_warehouseId: { productId: item.productId, warehouseId: receipt.warehouseId },
          },
        })

        if (existing) {
          await tx.stockItem.update({
            where: { id: existing.id },
            data: {
              quantity: existing.quantity + item.quantity,
              purchasePrice: pricePerBase ?? existing.purchasePrice,
            },
          })
        } else {
          await tx.stockItem.create({
            data: {
              productId: item.productId,
              warehouseId: receipt.warehouseId,
              quantity: item.quantity,
              purchasePrice: pricePerBase,
              estimatePrice: product?.estimatePrice,
              salePrice: product?.salePrice,
            },
          })
        }
      }

      await tx.stockMovement.createMany({
        data: receipt.items.map((item) => ({
          type: MovementType.RECEIPT,
          quantity: item.quantity,
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          userId,
          referenceId: receipt.id,
          referenceNumber: receipt.number,
        })),
      })

      await tx.goodsReceipt.update({ where: { id }, data: { status: ReceiptStatus.POSTED } })
    })

    return this.findById(id)
  }

  /** Отменяет поступление; если было проведено — возвращает остаток обратно. */
  async cancel(id: string, userId?: string) {
    const receipt = await this.findById(id)
    if (receipt.status === 'CANCELLED') return receipt

    if (receipt.status === 'POSTED') {
      await this.prisma.$transaction(async (tx) => {
        for (const item of receipt.items) {
          const stock = await tx.stockItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: receipt.warehouseId,
              },
            },
          })
          if (stock) {
            await tx.stockItem.update({
              where: { id: stock.id },
              data: { quantity: Math.max(0, stock.quantity - item.quantity) },
            })
          }
        }
        await tx.stockMovement.createMany({
          data: receipt.items.map((item) => ({
            type: MovementType.RECEIPT_CANCEL,
            quantity: item.quantity,
            productId: item.productId,
            warehouseId: receipt.warehouseId,
            userId,
            referenceId: receipt.id,
            referenceNumber: receipt.number,
          })),
        })
        await tx.goodsReceipt.update({ where: { id }, data: { status: ReceiptStatus.CANCELLED } })
      })
    } else {
      await this.prisma.goodsReceipt.update({
        where: { id },
        data: { status: ReceiptStatus.CANCELLED },
      })
    }

    return this.findById(id)
  }

  async remove(id: string) {
    const receipt = await this.findById(id)
    if (receipt.status === 'POSTED') {
      throw new BadRequestException('Сначала отмените проведённое поступление')
    }
    await this.prisma.goodsReceipt.delete({ where: { id } })
    return { message: 'Поступление удалено' }
  }

  // --- helpers ---

  private assertDraft(status: ReceiptStatus) {
    if (status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException('Изменять можно только черновик поступления')
    }
  }

  private async ensureWarehouse(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: warehouseId } })
    if (!warehouse) throw new NotFoundException('Склад не найден')
  }

  private async loadProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: PRODUCT_FIELDS,
    })
    if (!product) throw new NotFoundException('Товар не найден')
    if (!product.purchaseUnitId && !product.saleUnitId) {
      // базовой единицы достаточно
    }
    return product
  }

  /** Определяет единицу, коэффициент и количество в базовой единице для строки. */
  private resolveItem(
    product: {
      baseUnitId: string
      purchaseUnitId: string | null
      purchaseToBase: number
      saleUnitId: string | null
      saleToBase: number
    },
    dto: AddReceiptItemDto,
  ) {
    const unitId = dto.unitId ?? product.purchaseUnitId ?? product.baseUnitId
    const factor = this.factorForUnit(product, unitId)
    const quantity = dto.quantity * factor
    return { unitId, unitFactor: factor, unitQuantity: dto.quantity, quantity }
  }

  private factorForUnit(
    product: {
      baseUnitId: string
      purchaseUnitId: string | null
      purchaseToBase: number
      saleUnitId: string | null
      saleToBase: number
    },
    unitId: string,
  ): number {
    if (unitId === product.baseUnitId) return 1
    if (unitId === product.purchaseUnitId) return product.purchaseToBase
    if (unitId === product.saleUnitId) return product.saleToBase
    throw new BadRequestException('Единица измерения не настроена для этого товара')
  }

  private async generateNumber(): Promise<string> {
    const count = await this.prisma.goodsReceipt.count()
    let seq = count + 1
    let number = `ПР-${String(seq).padStart(6, '0')}`
    while (await this.prisma.goodsReceipt.findUnique({ where: { number } })) {
      seq += 1
      number = `ПР-${String(seq).padStart(6, '0')}`
    }
    return number
  }
}
