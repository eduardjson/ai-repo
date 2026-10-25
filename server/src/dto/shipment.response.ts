import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from './enums';
import { ProductDto } from './product.response';
import { WarehouseDto } from './warehouse.response';
import { ObjectDto } from './object.response';

export class ShipmentItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shipmentId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional({ type: () => ProductDto })
  product?: ProductDto;
}

export class ShipmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  objectId: string;

  @ApiProperty({ enum: ShipmentStatus })
  status: ShipmentStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional({ type: () => WarehouseDto })
  warehouse?: WarehouseDto;

  @ApiPropertyOptional({ type: () => ObjectDto })
  object?: ObjectDto;

  @ApiPropertyOptional({ type: () => [ShipmentItemDto] })
  items?: ShipmentItemDto[];
}
