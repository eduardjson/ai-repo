import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  create(@Body() dto: CreateTransferDto) {
    return this.transferService.create(dto);
  }
}
