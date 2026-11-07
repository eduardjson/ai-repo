import { IsString, IsOptional, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'

/** DTO строки поступления, используемый при добавлении позиции к черновику. */
export class AddReceiptItemDto {
  @IsString()
  productId: string

  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity: number

  /** Единица, в которой указано количество. По умолчанию — закупочная (или базовая) единица товара. */
  @IsOptional()
  @IsString()
  unitId?: string

  /** Цена за единицу приёмки (unitId). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number
}
