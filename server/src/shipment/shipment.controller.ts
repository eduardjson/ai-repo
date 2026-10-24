import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('shipments')
export class ShipmentController {
  constructor(private shipmentService: ShipmentService) {}

  @Get('by-object/:objectId')
  findByObject(@Param('objectId') objectId: string) {
    return this.shipmentService.findByObject(objectId);
  }

  @Get('by-warehouse/:warehouseId')
  findByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.shipmentService.findByWarehouse(warehouseId);
  }

  @Get()
  findAll(
    @Query('objectId') objectId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return this.shipmentService.findAll({ objectId, warehouseId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.shipmentService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentService.remove(id);
  }
}
