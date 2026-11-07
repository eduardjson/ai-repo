import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ReceiptStatus } from './enums'
import { ProductDto } from './product.response'
import { WarehouseDto } from './warehouse.response'
import { UnitDto } from './unit.response'
import { UserDto } from './user.response'

export class GoodsReceiptItemDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  receiptId: string

  @ApiProperty()
  productId: string

  @ApiProperty()
  quantity: number

  @ApiProperty()
  unitId: string

  @ApiProperty()
  unitQuantity: number

  @ApiProperty()
  unitFactor: number

  @ApiPropertyOptional({ nullable: true })
  purchasePrice?: number

  @ApiPropertyOptional({ type: () => ProductDto, nullable: true })
  product?: ProductDto

  @ApiPropertyOptional({ type: () => UnitDto, nullable: true })
  unit?: UnitDto
}

export class GoodsReceiptDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  number: string

  @ApiProperty()
  warehouseId: string

  @ApiPropertyOptional({ nullable: true })
  supplier?: string

  @ApiProperty()
  receiptDate: string

  @ApiProperty({ enum: ReceiptStatus })
  status: ReceiptStatus

  @ApiPropertyOptional({ nullable: true })
  comment?: string

  @ApiPropertyOptional({ nullable: true })
  createdById?: string

  @ApiPropertyOptional({ type: () => UserDto, nullable: true })
  createdBy?: UserDto

  @ApiProperty()
  createdAt: string

  @ApiProperty()
  updatedAt: string

  @ApiPropertyOptional({ type: () => WarehouseDto, nullable: true })
  warehouse?: WarehouseDto

  @ApiPropertyOptional({ type: () => [GoodsReceiptItemDto], nullable: true })
  items?: GoodsReceiptItemDto[]
}
