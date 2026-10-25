import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  url: string;
}

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  category?: string;

  @ApiPropertyOptional({ nullable: true })
  manufacturer?: string;

  @ApiPropertyOptional({ nullable: true })
  imageUrl?: string;

  @ApiPropertyOptional({ nullable: true })
  imageType?: string;

  @ApiPropertyOptional({ nullable: true })
  unit?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: () => [ProductImageDto] })
  images: ProductImageDto[];
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
