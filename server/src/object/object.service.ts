import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Injectable()
export class ObjectService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.object.findMany();
  }

  async findById(id: string) {
    const obj = await this.prisma.object.findUnique({ where: { id } });
    if (!obj) {
      throw new NotFoundException('Object not found');
    }
    return obj;
  }

  async create(dto: CreateObjectDto) {
    return this.prisma.object.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateObjectDto>) {
    await this.findById(id);
    return this.prisma.object.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.object.delete({ where: { id } });
  }
}
