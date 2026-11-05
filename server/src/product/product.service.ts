import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateInternalEan13, generateSku } from './barcode.util';
import { BarcodeType } from '../dto/enums';

interface FindAllParams {
  page: number;
  size: number;
  search?: string;
  categoryId?: string;
  manufacturerId?: string;
  includeInactive?: boolean;
}

const INCLUDE = {
  category: true,
  manufacturer: true,
  baseUnit: true,
  purchaseUnit: true,
  saleUnit: true,
  images: true,
  barcodes: { orderBy: { isPrimary: 'desc' as const } },
};

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindAllParams = { page: 1, size: 20 }) {
    const { page, size, search, categoryId, manufacturerId, includeInactive } = params;
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { name: { contains: search, mode: 'insensitive' } } },
        { barcodes: { some: { value: { contains: search } } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (manufacturerId) where.manufacturerId = manufacturerId;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: INCLUDE,
        omit: { imageData: true },
        skip: (page - 1) * size,
        take: size,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      size,
      pages: Math.ceil(total / size),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: INCLUDE,
      omit: { imageData: true },
    });
    if (!product) {
      throw new NotFoundException('Позиция не найдена');
    }
    return product;
  }

  /** Поиск позиции по любому штрихкоду (для сканера при приёмке). */
  async findByBarcode(value: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { value },
      include: { product: { include: INCLUDE, omit: { imageData: true } } },
    });
    if (!barcode) {
      throw new NotFoundException('Товар со штрихкодом не найден');
    }
    return barcode.product;
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File, userId?: string) {
    await this.validateUnits(dto.baseUnitId, dto.purchaseUnitId, dto.saleUnitId);

    const sku = dto.sku?.trim() || (await this.generateUniqueSku());
    const data: any = { ...this.sanitizeDto(dto), sku };
    if (file) {
      data.imageData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      data.imageType = file.mimetype;
    }
    if (userId) data.createdById = userId;

    const product = await this.prisma.product.create({
      data,
      include: INCLUDE,
      omit: { imageData: true },
    });

    await this.syncBarcodes(product.id, dto.barcodes, true);

    return this.findById(product.id);
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    await this.findById(id);
    if (dto.baseUnitId || dto.purchaseUnitId || dto.saleUnitId) {
      const current = await this.prisma.product.findUnique({ where: { id } });
      await this.validateUnits(
        dto.baseUnitId ?? current!.baseUnitId,
        dto.purchaseUnitId ?? current!.purchaseUnitId ?? undefined,
        dto.saleUnitId ?? current!.saleUnitId ?? undefined,
      );
    }

    const data: any = { ...this.sanitizeDto(dto) };
    if (dto.sku) data.sku = dto.sku.trim();
    if (file) {
      data.imageData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      data.imageType = file.mimetype;
    }

    await this.prisma.product.update({ where: { id }, data });

    if (dto.barcodes !== undefined) {
      await this.syncBarcodes(id, dto.barcodes, false);
    }

    return this.findById(id);
  }

  /** Архивация позиции вместо физического удаления (сохраняет историю документов). */
  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: INCLUDE,
      omit: { imageData: true },
    });
  }

  async getImage(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { imageData: true, imageType: true },
    });
    if (!product || !product.imageData) {
      throw new NotFoundException('Image not found');
    }
    return { buffer: product.imageData, type: product.imageType || 'image/png' };
  }

  async uploadImages(id: string, files: Express.Multer.File[]) {
    await this.findById(id);

    const uploadDir = path.join(process.cwd(), 'uploads', 'products', id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const images: Record<string, any>[] = [];
    for (const file of files) {
      const filePath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      const image = await this.prisma.productImage.create({
        data: {
          url: `/uploads/products/${id}/${file.originalname}`,
          productId: id,
        },
      });
      images.push(image);
    }

    return images;
  }

  async getImages(id: string) {
    await this.findById(id);
    return this.prisma.productImage.findMany({ where: { productId: id } });
  }

  // --- helpers ---

  private sanitizeDto(dto: CreateProductDto | UpdateProductDto) {
    const { barcodes, sku, ...rest } = dto as any;
    return rest;
  }

  private async validateUnits(baseUnitId: string, purchaseUnitId?: string, saleUnitId?: string) {
    const ids = [baseUnitId, purchaseUnitId, saleUnitId].filter(Boolean) as string[];
    const found = await this.prisma.unit.findMany({ where: { id: { in: ids } } });
    const foundIds = new Set(found.map((u) => u.id));
    for (const id of ids) {
      if (!foundIds.has(id)) {
        throw new BadRequestException('Указана несуществующая единица измерения');
      }
    }
  }

  private async generateUniqueSku(): Promise<string> {
    let seq = (await this.prisma.product.count()) + 1;
    let sku = generateSku('ART', seq);
    while (await this.prisma.product.findUnique({ where: { sku } })) {
      seq += 1;
      sku = generateSku('ART', seq);
    }
    return sku;
  }

  private async generateUniqueBarcode(): Promise<string> {
    let seq = (await this.prisma.barcode.count()) + 1;
    let value = generateInternalEan13(seq);
    while (await this.prisma.barcode.findUnique({ where: { value } })) {
      seq += 1;
      value = generateInternalEan13(seq);
    }
    return value;
  }

  /**
   * Синхронизирует штрихкоды позиции.
   * - create (generatePrimary): если штрихкоды не заданы — генерируем основной EAN-13.
   * - update: если поле `barcodes` передано — полностью заменяем набор.
   */
  private async syncBarcodes(
    productId: string,
    barcodes?: { value: string; type?: string; isPrimary?: boolean }[],
    generatePrimary = false,
  ) {
    const list = (barcodes ?? []).filter((b) => b.value && b.value.trim());
    const values = list.map((b) => b.value.trim());

    if (list.length === 0 && generatePrimary) {
      values.push(await this.generateUniqueBarcode());
    }

    // Проверяем дубликаты среди существующих штрихкодов (исключая эту позицию).
    const existing = await this.prisma.barcode.findMany({
      where: { value: { in: values }, productId: { not: productId } },
    });
    if (existing.length > 0) {
      throw new ConflictException(
        `Штрихкод уже используется: ${existing.map((e) => e.value).join(', ')}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.barcode.deleteMany({ where: { productId } });

      const rows = values.map((value, index) => {
        const input = list[index];
        const type = (input?.type as BarcodeType | undefined) ?? this.detectBarcodeType(value);
        const isPrimary =
          input?.isPrimary ?? (list.length === 0 ? true : index === 0);
        return { productId, value, type, isPrimary };
      });

      // Гарантируем ровно один основной штрихкод.
      const primaryIdx = rows.findIndex((r) => r.isPrimary);
      if (primaryIdx === -1 && rows.length > 0) rows[0].isPrimary = true;

      if (rows.length > 0) {
        await tx.barcode.createMany({ data: rows });
      }
    });
  }

  private detectBarcodeType(value: string): BarcodeType {
    if (/^\d{13}$/.test(value)) return BarcodeType.EAN13;
    if (/^\d{12}$/.test(value)) return BarcodeType.UPC;
    return BarcodeType.CODE128;
  }
}
