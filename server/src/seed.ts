import * as bcrypt from 'bcrypt';
import type { PrismaService } from './prisma/prisma.service';
import { generateInternalEan13, generateSku } from './product/barcode.util';
import { VatRate, BarcodeType } from './generated/prisma/client';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

/**
 * Создаёт администратора при первом старте, если его ещё нет.
 *
 * Учётные данные берутся из переменных окружения ADMIN_EMAIL / ADMIN_PASSWORD
 * (в development — значения по умолчанию). Повторный запуск ничего не меняет,
 * поэтому пароль не перезаписывается после того, как администратор его сменит.
 */
export async function seedAdmin(prisma: PrismaService): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      '[seed] ADMIN_PASSWORD не задан — используются учётные данные по умолчанию. ' +
        'Задайте ADMIN_EMAIL/ADMIN_PASSWORD в переменных окружения для production.',
    );
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password,
      firstName: 'Администратор',
      role: ['ADMIN'] as any,
    },
  });

  console.log(`[seed] Создан администратор: ${ADMIN_EMAIL}`);
}

const UNITS: { code: string; name: string; symbol: string }[] = [
  { code: 'pcs', name: 'штука', symbol: 'шт' },
  { code: 'kg', name: 'килограмм', symbol: 'кг' },
  { code: 't', name: 'тонна', symbol: 'т' },
  { code: 'm', name: 'метр', symbol: 'м' },
  { code: 'm2', name: 'метр квадратный', symbol: 'м²' },
  { code: 'm3', name: 'метр кубический', symbol: 'м³' },
  { code: 'l', name: 'литр', symbol: 'л' },
  { code: 'pack', name: 'упаковка', symbol: 'уп' },
  { code: 'roll', name: 'рулон', symbol: 'рулон' },
  { code: 'sheet', name: 'лист', symbol: 'лист' },
  { code: 'bag', name: 'мешок', symbol: 'мешок' },
  { code: 'set', name: 'комплект', symbol: 'компл' },
];

const CATEGORIES: { name: string; children?: string[] }[] = [
  { name: 'Пиломатериалы', children: ['Доска обрезная', 'Брус', 'Фанера', 'OSB-плита'] },
  { name: 'Металлопрокат', children: ['Арматура', 'Профлист'] },
  { name: 'Крепёж', children: ['Саморезы', 'Гвозди'] },
  { name: 'Бетон и растворы', children: ['Цемент', 'Сухие смеси'] },
  { name: 'Кровля и гидроизоляция', children: ['Металлочерепица', 'Гидроизоляция'] },
  { name: 'Изоляция', children: ['Утеплитель'] },
  { name: 'Отделка', children: ['Гипсокартон', 'Краска'] },
];

const MANUFACTURERS: { name: string; country: string }[] = [
  { name: 'КНАУФ', country: 'Германия' },
  { name: 'ТехноНИКОЛЬ', country: 'Россия' },
  { name: 'ROCKWOOL', country: 'Дания' },
  { name: 'Свеза', country: 'Россия' },
  { name: 'Северсталь', country: 'Россия' },
];

interface SeedProduct {
  sku: string;
  title: string;
  category: string;
  manufacturer?: string;
  baseUnit: string;
  purchaseUnit?: string;
  purchaseToBase?: number;
  saleUnit?: string;
  saleToBase?: number;
  purchasePrice: number;
  estimatePrice: number;
  salePrice: number;
  vatRate: VatRate;
  description?: string;
  grade?: string;
  material?: string;
  gost?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  weightKg?: number;
  minStock?: number;
  multiBarcode?: boolean;
}

const PRODUCTS: SeedProduct[] = [
  {
    sku: 'PIL-0001',
    title: 'Доска обрезная 25×150×6000 мм, сорт 1',
    category: 'Доска обрезная',
    baseUnit: 'm3',
    purchasePrice: 18500,
    estimatePrice: 22500,
    salePrice: 24500,
    vatRate: VatRate.VAT20,
    description: 'Доска обрезная хвойных пород, естественной влажности.',
    grade: '1 сорт',
    material: 'Хвоя (ель/сосна)',
    gost: 'ГОСТ 8486-86',
    lengthMm: 6000,
    widthMm: 150,
    heightMm: 25,
    minStock: 5,
  },
  {
    sku: 'FAN-0010',
    title: 'Фанера ФК 1525×1525×10 мм',
    category: 'Фанера',
    manufacturer: 'Свеза',
    baseUnit: 'sheet',
    purchasePrice: 950,
    estimatePrice: 1150,
    salePrice: 1300,
    vatRate: VatRate.VAT20,
    description: 'Фанера берёзовая, шлифованная, сорт Ш1.',
    grade: 'Ш1',
    gost: 'ГОСТ 3916.1-2018',
    lengthMm: 1525,
    widthMm: 1525,
    heightMm: 10,
    minStock: 50,
  },
  {
    sku: 'OSB-0012',
    title: 'OSB-3 2500×1250×12 мм',
    category: 'OSB-плита',
    baseUnit: 'sheet',
    purchasePrice: 1100,
    estimatePrice: 1350,
    salePrice: 1500,
    vatRate: VatRate.VAT20,
    description: 'Ориентированно-стружечная плита, влагостойкая.',
    lengthMm: 2500,
    widthMm: 1250,
    heightMm: 12,
    minStock: 40,
  },
  {
    sku: 'ARM-0012',
    title: 'Арматура А500С Ø12 мм',
    category: 'Арматура',
    manufacturer: 'Северсталь',
    baseUnit: 'kg',
    purchaseUnit: 't',
    purchaseToBase: 1000,
    saleUnit: 't',
    saleToBase: 1000,
    purchasePrice: 42,
    estimatePrice: 50,
    salePrice: 55,
    vatRate: VatRate.VAT20,
    description: 'Арматура периодического профиля, класс А500С.',
    grade: 'А500С',
    material: 'Сталь А500С',
    gost: 'ГОСТ 34028-2016',
    minStock: 2000,
    multiBarcode: true,
  },
  {
    sku: 'ARM-0008',
    title: 'Арматура А500С Ø8 мм',
    category: 'Арматура',
    manufacturer: 'Северсталь',
    baseUnit: 'kg',
    purchaseUnit: 't',
    purchaseToBase: 1000,
    saleUnit: 't',
    saleToBase: 1000,
    purchasePrice: 40,
    estimatePrice: 48,
    salePrice: 52,
    vatRate: VatRate.VAT20,
    grade: 'А500С',
    material: 'Сталь А500С',
    gost: 'ГОСТ 34028-2016',
    minStock: 1500,
  },
  {
    sku: 'GVZ-0070',
    title: 'Гвозди строительные 70×2,8 мм',
    category: 'Гвозди',
    baseUnit: 'kg',
    purchasePrice: 120,
    estimatePrice: 150,
    salePrice: 170,
    vatRate: VatRate.VAT20,
    material: 'Сталь',
    minStock: 50,
  },
  {
    sku: 'SAM-4270',
    title: 'Саморезы по дереву 4,2×70 мм (оцинк.)',
    category: 'Саморезы',
    baseUnit: 'pcs',
    purchaseUnit: 'pack',
    purchaseToBase: 1000,
    saleUnit: 'pack',
    saleToBase: 1000,
    purchasePrice: 0.85,
    estimatePrice: 1.0,
    salePrice: 1.15,
    vatRate: VatRate.VAT20,
    description: 'Саморезы универсальные с потайной головкой, упаковка 1000 шт.',
    material: 'Сталь, цинк',
    minStock: 20000,
    multiBarcode: true,
  },
  {
    sku: 'CEM-0500',
    title: 'Цемент ЦЕМ I 42,5Н (М500), мешок 50 кг',
    category: 'Цемент',
    manufacturer: 'КНАУФ',
    baseUnit: 'kg',
    purchaseUnit: 'bag',
    purchaseToBase: 50,
    saleUnit: 'bag',
    saleToBase: 50,
    purchasePrice: 9.5,
    estimatePrice: 11,
    salePrice: 12.5,
    vatRate: VatRate.VAT20,
    gost: 'ГОСТ 31108-2020',
    weightKg: 50,
    minStock: 5000,
  },
  {
    sku: 'IZO-0050',
    title: 'Утеплитель ROCKWOOL Лайт Баттс 50 мм',
    category: 'Утеплитель',
    manufacturer: 'ROCKWOOL',
    baseUnit: 'm2',
    purchasePrice: 450,
    estimatePrice: 520,
    salePrice: 580,
    vatRate: VatRate.VAT20,
    description: 'Минеральная вата, плита 1000×600×50 мм.',
    heightMm: 50,
    minStock: 100,
  },
  {
    sku: 'PRF-0008',
    title: 'Профлист С8 0,45 мм, оцинк.',
    category: 'Профлист',
    baseUnit: 'm2',
    purchasePrice: 320,
    estimatePrice: 380,
    salePrice: 420,
    vatRate: VatRate.VAT20,
    heightMm: 8,
    minStock: 200,
  },
  {
    sku: 'GKL-1250',
    title: 'Гипсокартон КНАУФ 2500×1200×12,5 мм',
    category: 'Гипсокартон',
    manufacturer: 'КНАУФ',
    baseUnit: 'sheet',
    purchasePrice: 380,
    estimatePrice: 450,
    salePrice: 520,
    vatRate: VatRate.VAT20,
    lengthMm: 2500,
    widthMm: 1200,
    heightMm: 12.5,
    minStock: 60,
  },
  {
    sku: 'GID-0010',
    title: 'Гидроизоляция ТехноНИКОЛЬ, рулон 10 м²',
    category: 'Гидроизоляция',
    manufacturer: 'ТехноНИКОЛЬ',
    baseUnit: 'roll',
    purchasePrice: 1200,
    estimatePrice: 1400,
    salePrice: 1600,
    vatRate: VatRate.VAT20,
    minStock: 20,
  },
  {
    sku: 'KRK-0001',
    title: 'Краска фасадная акриловая, 10 л',
    category: 'Краска',
    baseUnit: 'l',
    purchasePrice: 260,
    estimatePrice: 320,
    salePrice: 360,
    vatRate: VatRate.VAT20,
    minStock: 100,
  },
];

/**
 * Заполняет справочники (единицы, категории, производители) и, если номенклатура
 * пуста, создаёт демонстрационный набор позиций. Идемпотентно.
 */
export async function seedCatalog(prisma: PrismaService): Promise<void> {
  // Единицы измерения
  for (const u of UNITS) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: {},
      create: u,
    });
  }
  const units = new Map(
    (await prisma.unit.findMany()).map((u) => [u.code, u.id]),
  );

  // Категории (двухуровневые)
  for (const root of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { name: root.name },
      update: {},
      create: { name: root.name },
    });
    for (const child of root.children ?? []) {
      await prisma.category.upsert({
        where: { name: child },
        update: { parentId: created.id },
        create: { name: child, parentId: created.id },
      });
    }
  }
  const categories = new Map(
    (await prisma.category.findMany()).map((c) => [c.name, c.id]),
  );

  // Производители
  for (const m of MANUFACTURERS) {
    await prisma.manufacturer.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }
  const manufacturers = new Map(
    (await prisma.manufacturer.findMany()).map((m) => [m.name, m.id]),
  );

  // Демо-склад, чтобы можно было сразу тестировать приёмку.
  await prisma.warehouse.upsert({
    where: { name: 'Основной склад' },
    update: {},
    create: { name: 'Основной склад', address: 'г. Москва' },
  });

  // Номенклатура — только если ещё пусто.
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log('[seed] Номенклатура уже заполнена, пропускаем демо-позиции.');
    return;
  }

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        title: p.title,
        description: p.description,
        categoryId: categories.get(p.category),
        manufacturerId: p.manufacturer ? manufacturers.get(p.manufacturer) : undefined,
        baseUnitId: units.get(p.baseUnit)!,
        purchaseUnitId: p.purchaseUnit ? units.get(p.purchaseUnit) : undefined,
        purchaseToBase: p.purchaseToBase ?? 1,
        saleUnitId: p.saleUnit ? units.get(p.saleUnit) : undefined,
        saleToBase: p.saleToBase ?? 1,
        purchasePrice: p.purchasePrice,
        estimatePrice: p.estimatePrice,
        salePrice: p.salePrice,
        vatRate: p.vatRate,
        grade: p.grade,
        material: p.material,
        gost: p.gost,
        lengthMm: p.lengthMm,
        widthMm: p.widthMm,
        heightMm: p.heightMm,
        weightKg: p.weightKg,
        minStock: p.minStock,
      },
    });

    const barcodes: { productId: string; value: string; type: BarcodeType; isPrimary: boolean }[] = [
      { productId: product.id, value: generateInternalEan13(i + 1), type: BarcodeType.EAN13, isPrimary: true },
    ];
    if (p.multiBarcode) {
      barcodes.push({
        productId: product.id,
        value: p.sku,
        type: BarcodeType.CODE128,
        isPrimary: false,
      });
    }
    await prisma.barcode.createMany({ data: barcodes });
  }

  console.log(`[seed] Создано демо-позиций номенклатуры: ${PRODUCTS.length}`);
}
