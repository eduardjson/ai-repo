import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
  findAll() {
    return this.shipmentService.findAll();
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
