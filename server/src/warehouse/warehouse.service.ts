import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: { stockItems: true },
    });
  }

  async findById(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { stockItems: true },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: dto,
      include: { stockItems: true },
    });
  }

  async update(id: string, dto: Partial<CreateWarehouseDto>) {
    await this.findById(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
      include: { stockItems: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.warehouse.delete({ where: { id } });
  }

  async addStock(warehouseId: string, dto: AddStockDto) {
    await this.findById(warehouseId);

    const existing = await this.prisma.stockItem.findUnique({
      where: {
        productId_warehouseId: {
          productId: dto.productId,
          warehouseId,
        },
      },
    });

    if (existing) {
      return this.prisma.stockItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + dto.quantity,
          purchasePrice: dto.purchasePrice ?? existing.purchasePrice,
          estimatePrice: dto.estimatePrice ?? existing.estimatePrice,
          salePrice: dto.salePrice ?? existing.salePrice,
          discount: dto.discount ?? existing.discount,
        },
      });
    }

    return this.prisma.stockItem.create({
      data: {
        productId: dto.productId,
        warehouseId,
        quantity: dto.quantity,
        purchasePrice: dto.purchasePrice,
        estimatePrice: dto.estimatePrice,
        salePrice: dto.salePrice,
        discount: dto.discount,
      },
    });
  }

  async updateStock(stockId: string, warehouseId: string, dto: UpdateStockDto) {
    const stock = await this.prisma.stockItem.findUnique({ where: { id: stockId } });
    if (!stock || stock.warehouseId !== warehouseId) {
      throw new NotFoundException('Позиция на складе не найдена');
    }
    return this.prisma.stockItem.update({
      where: { id: stockId },
      data: dto,
      include: { product: true },
    });
  }

  async getStock(warehouseId: string) {
    await this.findById(warehouseId);
    return this.prisma.stockItem.findMany({
      where: { warehouseId },
      include: { product: true },
    });
  }

  async getGlobalPriceList() {
    const items = await this.prisma.stockItem.findMany({
      where: { quantity: { gt: 0 } },
      include: { product: true, warehouse: true },
    });
    return items.map((i) => this.toPriceListItem(i));
  }

  async getWarehousePriceList(warehouseId: string) {
    await this.findById(warehouseId);
    const items = await this.prisma.stockItem.findMany({
      where: { warehouseId, quantity: { gt: 0 } },
      include: { product: true, warehouse: true },
    });
    return items.map((i) => this.toPriceListItem(i));
  }

  private toPriceListItem(i: any) {
    return {
      id: i.id,
      productId: i.productId,
      productTitle: i.product.title,
      category: i.product.category,
      manufacturer: i.product.manufacturer,
      unit: i.product.unit,
      quantity: i.quantity,
      purchasePrice: i.purchasePrice,
      estimatePrice: i.estimatePrice,
      salePrice: i.salePrice,
      discount: i.discount,
      warehouseId: i.warehouseId,
      warehouseName: i.warehouse.name,
      firstArrivedAt: i.createdAt,
    };
  }
}
