import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageTextDto } from './dto/message-text.dto';
import { MessageDto } from '../dto/chat.response';

interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  username?: string;
}

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat/messages')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Get()
  @ApiOkResponse({ type: MessageDto, isArray: true })
  findAll(@Query('limit') limit?: string) {
    const parsed = limit ? Math.min(500, Math.max(1, parseInt(limit, 10))) : 100;
    return this.chatService.findAll(parsed);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiCreatedResponse({ type: MessageDto })
  async create(
    @Req() req: Request,
    @Body() dto: CreateMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user as AuthenticatedUser;
    const message = await this.chatService.create(
      user.id,
      this.displayName(user),
      dto.text ?? '',
      file,
    );
    this.chatGateway.emitMessageCreated(message);
    return message;
  }

  @Put(':id')
  @ApiOkResponse({ type: MessageDto })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MessageTextDto,
  ) {
    const user = req.user as AuthenticatedUser;
    const message = await this.chatService.update(id, user.id, dto.text);
    this.chatGateway.emitMessageUpdated(message);
    return message;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as AuthenticatedUser;
    const result = await this.chatService.remove(id, user.id);
    this.chatGateway.emitMessageDeleted(id);
    return result;
  }

  @Get(':messageId/attachments/:attachmentId')
  async download(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ) {
    const { fileName, mimeType, data } = await this.chatService.getAttachmentFile(
      messageId,
      attachmentId,
    );

    res.setHeader('Content-Type', mimeType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    res.setHeader('Content-Length', data.length);
    res.send(data);
  }

  private displayName(user: AuthenticatedUser): string {
    return user.firstName || user.username || user.email;
  }
}
