import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransferService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stockTransfer.findMany({
      include: { product: true, fromWarehouse: true, toWarehouse: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTransferDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Склады отправитель и получатель должны отличаться');
    }

    const from = await this.prisma.warehouse.findUnique({ where: { id: dto.fromWarehouseId } });
    const to = await this.prisma.warehouse.findUnique({ where: { id: dto.toWarehouseId } });
    if (!from || !to) {
      throw new NotFoundException('Склад не найден');
    }

    return this.prisma.$transaction(async (tx) => {
      const source = await tx.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.fromWarehouseId,
          },
        },
      });

      if (!source || source.quantity < dto.quantity) {
        throw new BadRequestException('Недостаточно товара на складе-отправителе');
      }

      await tx.stockItem.update({
        where: { id: source.id },
        data: { quantity: source.quantity - dto.quantity },
      });

      const dest = await tx.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.toWarehouseId,
          },
        },
      });

      if (dest) {
        await tx.stockItem.update({
          where: { id: dest.id },
          data: { quantity: dest.quantity + dto.quantity },
        });
      } else {
        await tx.stockItem.create({
          data: {
            productId: dto.productId,
            warehouseId: dto.toWarehouseId,
            quantity: dto.quantity,
            purchasePrice: source.purchasePrice,
            estimatePrice: source.estimatePrice,
            salePrice: source.salePrice,
            discount: source.discount,
          },
        });
      }

      return tx.stockTransfer.create({
        data: {
          productId: dto.productId,
          quantity: dto.quantity,
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
        },
        include: { product: true, fromWarehouse: true, toWarehouse: true },
      });
    });
  }
}
