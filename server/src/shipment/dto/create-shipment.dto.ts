import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ShipmentItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateShipmentDto {
  @IsString()
  warehouseId: string;

  @IsString()
  objectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items: ShipmentItemDto[];
}
