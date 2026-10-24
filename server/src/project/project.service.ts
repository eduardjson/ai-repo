import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }

  async create(userId: string, name: string, config: object) {
    return this.prisma.project.create({
      data: { name, config, userId },
    });
  }

  async update(id: string, userId: string, name: string, config: object) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: { name, config },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }
}
