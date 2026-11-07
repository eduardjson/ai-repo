import { IsString, IsOptional } from 'class-validator'

export class UpdateReceiptDto {
  @IsOptional()
  @IsString()
  warehouseId?: string

  @IsOptional()
  @IsString()
  supplier?: string

  @IsOptional()
  @IsString()
  comment?: string

  @IsOptional()
  @IsString()
  receiptDate?: string
}
