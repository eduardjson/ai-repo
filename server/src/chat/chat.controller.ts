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
} from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MessageTextDto } from './dto/message-text.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  username?: string;
}

@Controller('chat/messages')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    const parsed = limit ? Math.min(500, Math.max(1, parseInt(limit, 10))) : 100;
    return this.chatService.findAll(parsed);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() dto: MessageTextDto) {
    const user = req.user as AuthenticatedUser;
    const message = await this.chatService.create(
      user.id,
      this.displayName(user),
      dto.text,
    );
    this.chatGateway.emitMessageCreated(message);
    return message;
  }

  @Put(':id')
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

  private displayName(user: AuthenticatedUser): string {
    return user.firstName || user.username || user.email;
  }
}
