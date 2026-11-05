import { Controller, Get, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { StockTransferDto } from '../dto/transfer.response';

@ApiTags('transfers')
@ApiBearerAuth()
@Controller('transfers')
export class TransferController {
  constructor(private transferService: TransferService) {}

  @Get()
  @ApiOkResponse({ type: StockTransferDto, isArray: true })
  findAll() {
    return this.transferService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: StockTransferDto })
  create(@Body() dto: CreateTransferDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.transferService.create(dto, userId);
  }
}
