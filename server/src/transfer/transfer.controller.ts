import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Controller('transfers')
export class TransferController {
  constructor(private transferService: TransferService) {}

  @Get()
  findAll() {
    return this.transferService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTransferDto) {
    return this.transferService.create(dto);
  }
}
