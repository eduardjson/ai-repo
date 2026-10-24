import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { AddStockDto } from './dto/add-stock.dto';

@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('price-lists/all')
  getGlobalPriceList() {
    return this.warehouseService.getGlobalPriceList();
  }

  @Get()
  findAll() {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateWarehouseDto>) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @Post(':id/stock')
  addStock(@Param('id') id: string, @Body() dto: AddStockDto) {
    return this.warehouseService.addStock(id, dto);
  }

  @Get(':id/stock')
  getStock(@Param('id') id: string) {
    return this.warehouseService.getStock(id);
  }

  @Get(':id/price-list')
  getWarehousePriceList(@Param('id') id: string) {
    return this.warehouseService.getWarehousePriceList(id);
  }
}
