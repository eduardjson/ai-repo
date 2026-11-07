import { IsString, IsOptional, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateReceiptItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  quantity?: number

  @IsOptional()
  @IsString()
  unitId?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number
}
