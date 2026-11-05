import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.manufacturer.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const manufacturer = await this.prisma.manufacturer.findUnique({ where: { id } });
    if (!manufacturer) {
      throw new NotFoundException('Производитель не найден');
    }
    return manufacturer;
  }

  create(dto: CreateManufacturerDto) {
    return this.prisma.manufacturer.create({ data: dto });
  }

  async update(id: string, dto: UpdateManufacturerDto) {
    await this.findById(id);
    return this.prisma.manufacturer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    const productCount = await this.prisma.product.count({ where: { manufacturerId: id } });
    if (productCount > 0) {
      throw new BadRequestException('Производитель используется в номенклатуре и не может быть удалён');
    }
    return this.prisma.manufacturer.delete({ where: { id } });
  }
}
