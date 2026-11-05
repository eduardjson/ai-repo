import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Типы операций, увеличивающих остаток (приход).
const IN_TYPES = new Set(['RECEIPT', 'SHIPMENT_CANCEL', 'TRANSFER_IN', 'ADJUSTMENT_IN']);

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const trendStart = new Date(now);
    trendStart.setDate(now.getDate() - 13);
    trendStart.setHours(0, 0, 0, 0);
    const topStart = new Date(now);
    topStart.setDate(now.getDate() - 29);
    topStart.setHours(0, 0, 0, 0);

    const [
      products,
      stockItems,
      warehouses,
      objectsCount,
      pendingShipments,
      draftReceipts,
      movements,
    ] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          sku: true,
          minStock: true,
          purchasePrice: true,
          baseUnit: { select: { symbol: true } },
        },
      }),
      this.prisma.stockItem.findMany({
        select: { productId: true, warehouseId: true, quantity: true, purchasePrice: true },
      }),
      this.prisma.warehouse.findMany({ select: { id: true, name: true } }),
      this.prisma.object.count(),
      this.prisma.shipment.count({ where: { status: 'PENDING' } }),
      this.prisma.goodsReceipt.count({ where: { status: 'DRAFT' } }),
      this.prisma.stockMovement.findMany({
        where: { createdAt: { gte: topStart } },
        select: { type: true, quantity: true, productId: true, createdAt: true },
      }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Стоимость запасов, остатки по товару и по складу.
    let inventoryValue = 0;
    const qtyByProduct = new Map<string, number>();
    const warehouseValue = new Map<string, number>();
    const warehouseSku = new Map<string, Set<string>>();

    for (const s of stockItems) {
      // Себестоимость — по фактической цене приёмки, иначе по каталожной.
      const price = s.purchasePrice ?? productMap.get(s.productId)?.purchasePrice ?? 0;
      const value = s.quantity * price;
      inventoryValue += value;
      qtyByProduct.set(s.productId, (qtyByProduct.get(s.productId) ?? 0) + s.quantity);
      warehouseValue.set(s.warehouseId, (warehouseValue.get(s.warehouseId) ?? 0) + value);
      if (!warehouseSku.has(s.warehouseId)) warehouseSku.set(s.warehouseId, new Set());
      warehouseSku.get(s.warehouseId)!.add(s.productId);
    }

    // Низкий запас и отсутствие на складе.
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStock: { productId: string; title: string; sku: string; unit: string; quantity: number; minStock: number }[] = [];
    for (const p of products) {
      const qty = qtyByProduct.get(p.id) ?? 0;
      if (qty === 0) outOfStockCount++;
      if (p.minStock != null && qty < p.minStock) {
        lowStockCount++;
        lowStock.push({
          productId: p.id,
          title: p.title,
          sku: p.sku,
          unit: p.baseUnit?.symbol ?? '',
          quantity: qty,
          minStock: p.minStock,
        });
      }
    }
    lowStock.sort((a, b) => a.quantity / a.minStock - b.quantity / b.minStock);

    const inStockProducts = [...qtyByProduct.values()].filter((q) => q > 0).length;

    const warehousesOut = warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      stockValue: warehouseValue.get(w.id) ?? 0,
      skuCount: warehouseSku.get(w.id)?.size ?? 0,
    }));

    // Тренд движения за 14 дней (в деньгах) и топ товаров за 30 дней.
    const trendMap = new Map<string, { incoming: number; outgoing: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      trendMap.set(localDateKey(d), { incoming: 0, outgoing: 0 });
    }
    const movedByProduct = new Map<string, { qty: number; value: number }>();

    for (const m of movements) {
      const price = productMap.get(m.productId)?.purchasePrice ?? 0;
      const value = m.quantity * price;

      const cur = movedByProduct.get(m.productId) ?? { qty: 0, value: 0 };
      cur.qty += m.quantity;
      cur.value += value;
      movedByProduct.set(m.productId, cur);

      const key = localDateKey(m.createdAt);
      if (trendMap.has(key)) {
        const pt = trendMap.get(key)!;
        if (IN_TYPES.has(m.type)) pt.incoming += value;
        else pt.outgoing += value;
      }
    }

    const movementTrend = [...trendMap.entries()].map(([date, v]) => ({
      date,
      incoming: Math.round(v.incoming),
      outgoing: Math.round(v.outgoing),
    }));

    const topProducts = [...movedByProduct.entries()]
      .map(([productId, v]) => {
        const p = productMap.get(productId);
        return {
          productId,
          title: p?.title ?? '',
          sku: p?.sku ?? '',
          unit: p?.baseUnit?.symbol ?? '',
          movedQty: Math.round(v.qty * 100) / 100,
          movedValue: Math.round(v.value),
        };
      })
      .sort((a, b) => b.movedValue - a.movedValue)
      .slice(0, 5);

    return {
      inventoryValue: Math.round(inventoryValue),
      activeProducts: products.length,
      inStockProducts,
      lowStockCount,
      outOfStockCount,
      pendingShipments,
      draftReceipts,
      warehousesCount: warehouses.length,
      objectsCount,
      warehouses: warehousesOut,
      movementTrend,
      topProducts,
      lowStock: lowStock.slice(0, 8),
    };
  }
}
