import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 100) {
    return this.prisma.message.findMany({
      include: { attachments: true },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async create(userId: string, userName: string, text: string) {
    return this.prisma.message.create({
      data: { userId, userName, text },
      include: { attachments: true },
    });
  }

  async update(id: number, userId: string, text: string) {
    await this.assertOwner(id, userId);
    return this.prisma.message.update({
      where: { id },
      data: { text },
      include: { attachments: true },
    });
  }

  async remove(id: number, userId: string) {
    await this.assertOwner(id, userId);
    await this.prisma.message.delete({ where: { id } });
    return { id };
  }

  private async assertOwner(id: number, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.userId !== userId) {
      throw new ForbiddenException('You can only modify your own messages');
    }
    return message;
  }
}
