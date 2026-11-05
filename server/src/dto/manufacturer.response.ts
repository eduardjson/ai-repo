import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManufacturerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  country?: string;

  @ApiProperty()
  createdAt: string;
}
