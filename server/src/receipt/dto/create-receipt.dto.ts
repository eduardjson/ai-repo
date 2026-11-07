import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

// Вложенный класс намеренно не экспортируется: плагин @nestjs/swagger генерирует
// прямую ссылку на класс из того же файла (иначе — битый require на исходник).
class CreateReceiptItemDto {
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

export class CreateReceiptDto {
  @IsString()
  warehouseId: string

  @IsOptional()
  @IsString()
  supplier?: string

  @IsOptional()
  @IsString()
  comment?: string

  @IsOptional()
  @IsString()
  receiptDate?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items?: CreateReceiptItemDto[]
}
