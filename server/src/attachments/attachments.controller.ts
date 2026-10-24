import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { Public } from '../auth/public.decorator';

@Controller('attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get(':id')
  @Public()
  async download(@Param('id') id: string, @Res() res: Response) {
    const { attachment, path: filePath } = await this.attachmentsService.getFile(id);
    res.sendFile(filePath);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    return this.attachmentsService.saveFiles(files);
  }
}
