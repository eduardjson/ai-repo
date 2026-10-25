import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PriceListItemDto, StockItemDto, WarehouseDto } from '../dto/warehouse.response';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('price-lists/all')
  @ApiOkResponse({ type: PriceListItemDto, isArray: true })
  getGlobalPriceList() {
    return this.warehouseService.getGlobalPriceList();
  }

  @Get()
  @ApiOkResponse({ type: WarehouseDto, isArray: true })
  findAll() {
    return this.warehouseService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: WarehouseDto })
  findOne(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: WarehouseDto })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: WarehouseDto })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @Post(':id/stock')
  @ApiCreatedResponse({ type: StockItemDto })
  addStock(@Param('id') id: string, @Body() dto: AddStockDto) {
    return this.warehouseService.addStock(id, dto);
  }

  @Patch(':id/stock/:stockId')
  @ApiOkResponse({ type: StockItemDto })
  updateStock(
    @Param('id') id: string,
    @Param('stockId') stockId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.warehouseService.updateStock(stockId, id, dto);
  }

  @Get(':id/stock')
  @ApiOkResponse({ type: StockItemDto, isArray: true })
  getStock(@Param('id') id: string) {
    return this.warehouseService.getStock(id);
  }

  @Get(':id/price-list')
  @ApiOkResponse({ type: PriceListItemDto, isArray: true })
  getWarehousePriceList(@Param('id') id: string) {
    return this.warehouseService.getWarehousePriceList(id);
  }
}
