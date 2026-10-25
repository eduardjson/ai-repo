import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDto } from './product.response';

export class WarehouseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  address?: string;

  @ApiPropertyOptional({ nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ nullable: true })
  longitude?: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class StockItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional({ nullable: true })
  purchasePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  estimatePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  salePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  discount?: number;

  @ApiPropertyOptional({ type: () => ProductDto })
  product?: ProductDto;
}

export class PriceListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productTitle: string;

  @ApiPropertyOptional({ nullable: true })
  category?: string;

  @ApiPropertyOptional({ nullable: true })
  manufacturer?: string;

  @ApiPropertyOptional({ nullable: true })
  unit?: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional({ nullable: true })
  purchasePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  estimatePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  salePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  discount?: number;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  warehouseName: string;

  @ApiPropertyOptional({ nullable: true })
  firstArrivedAt?: string;
}
