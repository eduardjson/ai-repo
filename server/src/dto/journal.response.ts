import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from './enums';
import { ProductDto } from './product.response';
import { WarehouseDto } from './warehouse.response';
import { ObjectDto } from './object.response';
import { UserDto } from './user.response';

export class StockMovementDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: MovementType })
  type: MovementType;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  warehouseId: string;

  @ApiPropertyOptional({ nullable: true })
  objectId?: string;

  @ApiPropertyOptional({ nullable: true })
  userId?: string;

  @ApiPropertyOptional({ nullable: true })
  referenceId?: string;

  @ApiPropertyOptional({ nullable: true })
  referenceNumber?: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional({ type: () => ProductDto, nullable: true })
  product?: ProductDto;

  @ApiPropertyOptional({ type: () => WarehouseDto, nullable: true })
  warehouse?: WarehouseDto;

  @ApiPropertyOptional({ type: () => ObjectDto, nullable: true })
  object?: ObjectDto;

  @ApiPropertyOptional({ type: () => UserDto, nullable: true })
  user?: UserDto;
}

export class StockMovementListResponseDto {
  @ApiProperty({ type: () => [StockMovementDto] })
  items: StockMovementDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  pages: number;
}
