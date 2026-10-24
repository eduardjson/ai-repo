import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface FindAllParams {
  page: number;
  size: number;
  search?: string;
  category?: string;
  manufacturer?: string;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindAllParams = { page: 1, size: 20 }) {
    const { page, size, search, category, manufacturer } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (manufacturer) where.manufacturer = manufacturer;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: true },
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
      include: { images: true },
      omit: { imageData: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    const data: any = { ...dto };
    if (file) {
      data.imageData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      data.imageType = file.mimetype;
    }
    return this.prisma.product.create({
      data,
      include: { images: true },
      omit: { imageData: true },
    });
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    await this.findById(id);
    const data: any = { ...dto };
    if (file) {
      data.imageData = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
      data.imageType = file.mimetype;
    }
    return this.prisma.product.update({
      where: { id },
      data,
      include: { images: true },
      omit: { imageData: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
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
}
