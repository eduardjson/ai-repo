import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

class BarcodeInputDto {
  @IsString()
  value: string

  @IsOptional()
  @IsIn(['EAN13', 'CODE128', 'UPC', 'QR'])
  type?: string

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  sku?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  manufacturerId?: string

  @IsOptional()
  @IsString()
  baseUnitId?: string

  @IsOptional()
  @IsString()
  purchaseUnitId?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  purchaseToBase?: number

  @IsOptional()
  @IsString()
  saleUnitId?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  saleToBase?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatePrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number

  @IsOptional()
  @IsIn(['NONE', 'VAT0', 'VAT10', 'VAT20'])
  vatRate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lengthMm?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  widthMm?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  heightMm?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volumeM3?: number

  @IsOptional()
  @IsString()
  grade?: string

  @IsOptional()
  @IsString()
  material?: string

  @IsOptional()
  @IsString()
  gost?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BarcodeInputDto)
  barcodes?: BarcodeInputDto[]
}
