import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CameraType } from './enums';

export class ObjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  address?: string;

  @ApiPropertyOptional({ nullable: true })
  latitude?: number;

  @ApiPropertyOptional({ nullable: true })
  longitude?: number;

  @ApiPropertyOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  cameraUrl?: string;

  @ApiPropertyOptional({ enum: CameraType, nullable: true })
  cameraType?: CameraType;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
