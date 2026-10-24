import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async saveFiles(files: Express.Multer.File[]) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const attachments: Record<string, any>[] = [];
    for (const file of files) {
      const id = uuid.v4();
      const ext = path.extname(file.originalname);
      const fileName = `${id}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      const attachment = await this.prisma.attachment.create({
        data: {
          id,
          messageId: 0,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          filePath: `/uploads/attachments/${fileName}`,
        },
      });
      attachments.push(attachment);
    }

    return attachments;
  }

  async getFile(id: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const fullPath = path.join(process.cwd(), attachment.filePath.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }

    return { attachment, path: fullPath };
  }
}
