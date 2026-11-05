import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  parentId?: string;

  @ApiPropertyOptional({ type: () => [CategoryDto], nullable: true })
  children?: CategoryDto[];

  @ApiProperty()
  createdAt: string;
}
