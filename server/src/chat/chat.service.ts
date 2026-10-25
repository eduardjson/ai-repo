import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MESSAGE_INCLUDE = {
  attachments: {
    select: { id: true, fileName: true, fileSize: true, mimeType: true, uploadedAt: true },
  },
  user: {
    select: { id: true, avatar: true, firstName: true, lastName: true, username: true },
  },
} as const;

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 100) {
    return this.prisma.message.findMany({
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async create(userId: string, userName: string, text: string, file?: UploadedFile) {
    if (!text && !file) {
      throw new BadRequestException('Сообщение или файл обязательны');
    }

    if (file) {
      this.assertPdf(file);
    }

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: { userId, userName, text: text ?? '' },
      });

      if (file) {
        await tx.attachment.create({
          data: {
            messageId: message.id,
            fileName: this.decodeFileName(file.originalname),
            fileSize: file.size,
            mimeType: file.mimetype,
            data: Buffer.from(file.buffer),
          },
        });
      }

      return tx.message.findUniqueOrThrow({
        where: { id: message.id },
        include: MESSAGE_INCLUDE,
      });
    });
  }

  async update(id: number, userId: string, text: string) {
    await this.assertLatestOwned(id, userId);
    return this.prisma.message.update({
      where: { id },
      data: { text },
      include: MESSAGE_INCLUDE,
    });
  }

  async remove(id: number, userId: string) {
    await this.assertLatestOwned(id, userId);
    await this.prisma.message.delete({ where: { id } });
    return { id };
  }

  async getAttachmentFile(messageId: number, attachmentId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, messageId },
    });
    if (!attachment) {
      throw new NotFoundException('Файл не найден');
    }
    return {
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      data: Buffer.from(attachment.data),
    };
  }

  private assertPdf(file: UploadedFile) {
    if (file.mimetype !== 'application/pdf' && !this.decodeFileName(file.originalname).toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Можно прикрепить только PDF-файл');
    }
    if (file.size > MAX_PDF_BYTES) {
      throw new BadRequestException('Файл слишком большой (максимум 10 МБ)');
    }
  }

  /**
   * Multer 1.x (bundled busboy) decodes the multipart `filename` parameter as
   * latin1, which mangles non-ASCII (e.g. Cyrillic) names. Re-encode as latin1
   * and decode as UTF-8 to recover the original name. Names that already
   * contain code points above 255 are left untouched (they arrived decoded).
   */
  private decodeFileName(name: string): string {
    if ([...name].some((ch) => (ch.codePointAt(0) ?? 0) > 255)) {
      return name;
    }
    return Buffer.from(name, 'latin1').toString('utf8');
  }

  private async assertLatestOwned(id: number, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }
    if (message.userId !== userId) {
      throw new ForbiddenException('Можно изменять только свои сообщения');
    }
    const latest = await this.prisma.message.findFirst({ orderBy: { id: 'desc' } });
    if (!latest || latest.id !== id) {
      throw new ForbiddenException('Можно изменять или удалять только последнее сообщение');
    }
    return message;
  }
}
