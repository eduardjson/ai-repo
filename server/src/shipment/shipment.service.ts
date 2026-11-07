import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateShipmentDto } from './dto/create-shipment.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { MovementType } from '../generated/prisma/client'

const INCLUDE = {
  items: { include: { product: true } },
  warehouse: true,
  object: true,
}

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { objectId?: string; warehouseId?: string; status?: string }) {
    const where: any = {}
    if (filters?.objectId) where.objectId = filters.objectId
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId
    if (filters?.status) where.status = filters.status
    return this.prisma.shipment.findMany({
      where,
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: INCLUDE,
    })
    if (!shipment) {
      throw new NotFoundException('Shipment not found')
    }
    return shipment
  }

  async create(dto: CreateShipmentDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const stock = await tx.stockItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: dto.warehouseId,
            },
          },
        })

        if (!stock || stock.quantity < item.quantity) {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          throw new BadRequestException(
            `Недостаточно товара «${product?.title ?? item.productId}» на складе`,
          )
        }

        await tx.stockItem.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity - item.quantity },
        })
      }

      const shipment = await tx.shipment.create({
        data: {
          warehouseId: dto.warehouseId,
          objectId: dto.objectId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: INCLUDE,
      })

      await tx.stockMovement.createMany({
        data: dto.items.map((item) => ({
          type: MovementType.SHIPMENT,
          quantity: item.quantity,
          productId: item.productId,
          warehouseId: dto.warehouseId,
          objectId: dto.objectId,
          userId,
          referenceId: shipment.id,
        })),
      })

      return shipment
    })
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId?: string) {
    const shipment = await this.findById(id)
    const newStatus = dto.status
    const oldStatus = shipment.status

    if (oldStatus === newStatus) {
      return shipment
    }

    const movingToCancelled = newStatus === 'CANCELLED'
    const movingFromCancelled = oldStatus === 'CANCELLED'

    // Stock is decremented at creation and restored on cancellation.
    // So: cancel restores stock, un-cancel re-decrements stock.
    const shouldRestoreStock = movingToCancelled && !movingFromCancelled
    const shouldDecrementStock = movingFromCancelled && !movingToCancelled

    return this.prisma.$transaction(async (tx) => {
      if (shouldRestoreStock || shouldDecrementStock) {
        for (const item of shipment.items) {
          const stock = await tx.stockItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: shipment.warehouseId,
              },
            },
          })

          if (shouldRestoreStock && stock) {
            await tx.stockItem.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity + item.quantity },
            })
          }

          if (shouldDecrementStock) {
            if (!stock || stock.quantity < item.quantity) {
              throw new BadRequestException(
                `Недостаточно товара на складе для возврата отгрузки в работу`,
              )
            }
            await tx.stockItem.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity - item.quantity },
            })
          }
        }

        await tx.stockMovement.createMany({
          data: shipment.items.map((item) => ({
            type: shouldRestoreStock ? MovementType.SHIPMENT_CANCEL : MovementType.SHIPMENT,
            quantity: item.quantity,
            productId: item.productId,
            warehouseId: shipment.warehouseId,
            objectId: shipment.objectId,
            userId,
            referenceId: shipment.id,
          })),
        })
      }

      return tx.shipment.update({
        where: { id },
        data: { status: newStatus as any },
        include: INCLUDE,
      })
    })
  }

  async remove(id: string, userId?: string) {
    const shipment = await this.findById(id)

    // Stock was decremented at creation and is only restored when the
    // shipment is cancelled. Any non-cancelled shipment still holds stock
    // reserved, so restore it before deleting.
    if (shipment.status !== 'CANCELLED') {
      await this.prisma.$transaction(async (tx) => {
        for (const item of shipment.items) {
          const stock = await tx.stockItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: shipment.warehouseId,
              },
            },
          })

          if (stock) {
            await tx.stockItem.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity + item.quantity },
            })
          }
        }

        await tx.stockMovement.createMany({
          data: shipment.items.map((item) => ({
            type: MovementType.SHIPMENT_CANCEL,
            quantity: item.quantity,
            productId: item.productId,
            warehouseId: shipment.warehouseId,
            objectId: shipment.objectId,
            userId,
            referenceId: shipment.id,
          })),
        })

        await tx.shipment.delete({ where: { id } })
      })
    } else {
      await this.prisma.shipment.delete({ where: { id } })
    }

    return { message: 'Shipment deleted' }
  }

  async findByObject(objectId: string) {
    return this.prisma.shipment.findMany({
      where: { objectId },
      include: INCLUDE,
    })
  }

  async findByWarehouse(warehouseId: string) {
    return this.prisma.shipment.findMany({
      where: { warehouseId },
      include: INCLUDE,
    })
  }
}
