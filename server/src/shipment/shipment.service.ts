import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shipment.findMany({
      include: {
        items: { include: { product: true } },
        warehouse: true,
        object: true,
      },
    });
  }

  async findById(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        warehouse: true,
        object: true,
      },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }
    return shipment;
  }

  async create(dto: CreateShipmentDto) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const stock = await tx.stockItem.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: dto.warehouseId,
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }

        await tx.stockItem.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity - item.quantity },
        });
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
        include: {
          items: { include: { product: true } },
          warehouse: true,
          object: true,
        },
      });

      return shipment;
    });
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const shipment = await this.findById(id);
    return this.prisma.shipment.update({
      where: { id },
      data: { status: dto.status as any },
      include: {
        items: { include: { product: true } },
        warehouse: true,
        object: true,
      },
    });
  }

  async remove(id: string) {
    const shipment = await this.findById(id);

    if (shipment.status === 'COMPLETED') {
      await this.prisma.$transaction(async (tx) => {
        for (const item of shipment.items) {
          const stock = await tx.stockItem.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: shipment.warehouseId,
              },
            },
          });

          if (stock) {
            await tx.stockItem.update({
              where: { id: stock.id },
              data: { quantity: stock.quantity + item.quantity },
            });
          }
        }

        await tx.shipment.delete({ where: { id } });
      });
    } else {
      await this.prisma.shipment.delete({ where: { id } });
    }

    return { message: 'Shipment deleted' };
  }

  async findByObject(objectId: string) {
    return this.prisma.shipment.findMany({
      where: { objectId },
      include: {
        items: { include: { product: true } },
        warehouse: true,
        object: true,
      },
    });
  }

  async findByWarehouse(warehouseId: string) {
    return this.prisma.shipment.findMany({
      where: { warehouseId },
      include: {
        items: { include: { product: true } },
        warehouse: true,
        object: true,
      },
    });
  }
}
