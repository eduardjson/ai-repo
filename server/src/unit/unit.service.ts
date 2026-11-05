import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.unit.findMany({ orderBy: { code: 'asc' } });
  }

  async findById(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException('Единица измерения не найдена');
    }
    return unit;
  }

  create(dto: CreateUnitDto) {
    return this.prisma.unit.create({ data: dto });
  }

  async update(id: string, dto: UpdateUnitDto) {
    await this.findById(id);
    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    const usedIn = await this.prisma.product.count({
      where: { OR: [{ baseUnitId: id }, { purchaseUnitId: id }, { saleUnitId: id }] },
    });
    if (usedIn > 0) {
      throw new BadRequestException('Единица измерения используется в номенклатуре и не может быть удалена');
    }
    return this.prisma.unit.delete({ where: { id } });
  }
}
