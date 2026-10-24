import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateItemDto) {
    return this.prisma.item.create({ data: dto });
  }
}
