import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { AddReceiptItemDto } from './dto/add-receipt-item.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { UpdateReceiptItemDto } from './dto/update-receipt-item.dto';
import { GoodsReceiptDto, GoodsReceiptItemDto } from '../dto/receipt.response';

@ApiTags('receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Get()
  @ApiOkResponse({ type: GoodsReceiptDto, isArray: true })
  findAll(@Query('status') status?: string) {
    return this.receiptService.findAll(status);
  }

  @Get(':id')
  @ApiOkResponse({ type: GoodsReceiptDto })
  findOne(@Param('id') id: string) {
    return this.receiptService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: GoodsReceiptDto })
  create(@Body() dto: CreateReceiptDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.receiptService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOkResponse({ type: GoodsReceiptDto })
  update(@Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    return this.receiptService.update(id, dto);
  }

  @Post(':id/items')
  @ApiOkResponse({ type: GoodsReceiptDto })
  addItem(@Param('id') id: string, @Body() dto: AddReceiptItemDto) {
    return this.receiptService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOkResponse({ type: GoodsReceiptDto })
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateReceiptItemDto,
  ) {
    return this.receiptService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOkResponse({ type: GoodsReceiptDto })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.receiptService.removeItem(id, itemId);
  }

  @Post(':id/post')
  @ApiOkResponse({ type: GoodsReceiptDto })
  post(@Param('id') id: string) {
    return this.receiptService.post(id);
  }

  @Post(':id/cancel')
  @ApiOkResponse({ type: GoodsReceiptDto })
  cancel(@Param('id') id: string) {
    return this.receiptService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptService.remove(id);
  }
}
