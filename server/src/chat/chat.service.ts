import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages() {
    return this.prisma.message.findMany({
      include: { attachments: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(userId: string, userName: string, text: string) {
    return this.prisma.message.create({
      data: { userId, userName, text },
      include: { attachments: true },
    });
  }

  async updateMessage(id: number, userId: string, text: string) {
    const msg = await this.prisma.message.findUnique({ where: { id } });
    if (!msg || msg.userId !== userId) {
      throw new Error('Unauthorized or not found');
    }
    return this.prisma.message.update({
      where: { id },
      data: { text },
      include: { attachments: true },
    });
  }

  async deleteMessage(id: number, userId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id } });
    if (!msg || msg.userId !== userId) {
      throw new Error('Unauthorized or not found');
    }
    await this.prisma.message.delete({ where: { id } });
    return { message: 'Deleted' };
  }

  async clearMessages() {
    await this.prisma.message.deleteMany({});
    return { message: 'All messages cleared' };
  }
}
