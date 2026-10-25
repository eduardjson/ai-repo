import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDto } from './product.response';
import { WarehouseDto } from './warehouse.response';

export class StockTransferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  fromWarehouseId: string;

  @ApiProperty()
  toWarehouseId: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional({ type: () => ProductDto })
  product?: ProductDto;

  @ApiPropertyOptional({ type: () => WarehouseDto })
  fromWarehouse?: WarehouseDto;

  @ApiPropertyOptional({ type: () => WarehouseDto })
  toWarehouse?: WarehouseDto;
}
