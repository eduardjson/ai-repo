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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ShipmentDto } from '../dto/shipment.response';

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
export class ShipmentController {
  constructor(private shipmentService: ShipmentService) {}

  @Get('by-object/:objectId')
  @ApiOkResponse({ type: ShipmentDto, isArray: true })
  findByObject(@Param('objectId') objectId: string) {
    return this.shipmentService.findByObject(objectId);
  }

  @Get('by-warehouse/:warehouseId')
  @ApiOkResponse({ type: ShipmentDto, isArray: true })
  findByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.shipmentService.findByWarehouse(warehouseId);
  }

  @Get()
  @ApiOkResponse({ type: ShipmentDto, isArray: true })
  findAll(
    @Query('objectId') objectId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return this.shipmentService.findAll({ objectId, warehouseId, status });
  }

  @Get(':id')
  @ApiOkResponse({ type: ShipmentDto })
  findOne(@Param('id') id: string) {
    return this.shipmentService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ShipmentDto })
  create(@Body() dto: CreateShipmentDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.shipmentService.create(dto, userId);
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: ShipmentDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.shipmentService.updateStatus(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    return this.shipmentService.remove(id, userId);
  }
}
