import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VatRate, BarcodeType } from './enums';
import { CategoryDto } from './category.response';
import { ManufacturerDto } from './manufacturer.response';
import { UnitDto } from './unit.response';

export class ProductImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  url: string;
}

export class BarcodeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  value: string;

  @ApiProperty({ enum: BarcodeType })
  type: BarcodeType;

  @ApiProperty()
  isPrimary: boolean;
}

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  categoryId?: string;

  @ApiPropertyOptional({ type: () => CategoryDto, nullable: true })
  category?: CategoryDto;

  @ApiPropertyOptional({ nullable: true })
  manufacturerId?: string;

  @ApiPropertyOptional({ type: () => ManufacturerDto, nullable: true })
  manufacturer?: ManufacturerDto;

  @ApiProperty()
  baseUnitId: string;

  @ApiPropertyOptional({ type: () => UnitDto, nullable: true })
  baseUnit?: UnitDto;

  @ApiPropertyOptional({ nullable: true })
  purchaseUnitId?: string;

  @ApiPropertyOptional({ type: () => UnitDto, nullable: true })
  purchaseUnit?: UnitDto;

  @ApiProperty()
  purchaseToBase: number;

  @ApiPropertyOptional({ nullable: true })
  saleUnitId?: string;

  @ApiPropertyOptional({ type: () => UnitDto, nullable: true })
  saleUnit?: UnitDto;

  @ApiProperty()
  saleToBase: number;

  @ApiPropertyOptional({ nullable: true })
  purchasePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  estimatePrice?: number;

  @ApiPropertyOptional({ nullable: true })
  salePrice?: number;

  @ApiProperty({ enum: VatRate })
  vatRate: VatRate;

  @ApiPropertyOptional({ nullable: true })
  weightKg?: number;

  @ApiPropertyOptional({ nullable: true })
  lengthMm?: number;

  @ApiPropertyOptional({ nullable: true })
  widthMm?: number;

  @ApiPropertyOptional({ nullable: true })
  heightMm?: number;

  @ApiPropertyOptional({ nullable: true })
  volumeM3?: number;

  @ApiPropertyOptional({ nullable: true })
  grade?: string;

  @ApiPropertyOptional({ nullable: true })
  material?: string;

  @ApiPropertyOptional({ nullable: true })
  gost?: string;

  @ApiPropertyOptional({ nullable: true })
  country?: string;

  @ApiPropertyOptional({ nullable: true })
  minStock?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ nullable: true })
  imageUrl?: string;

  @ApiPropertyOptional({ nullable: true })
  imageType?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: () => [ProductImageDto] })
  images: ProductImageDto[];

  @ApiProperty({ type: () => [BarcodeDto] })
  barcodes: BarcodeDto[];
}

export class ProductListResponseDto {
  @ApiProperty({ type: () => [ProductDto] })
  items: ProductDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  size: number;

  @ApiProperty()
  pages: number;
}
