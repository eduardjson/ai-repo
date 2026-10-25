import { IsString, IsOptional, IsLatitude, IsLongitude, IsIn } from 'class-validator';

export class CreateObjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cameraUrl?: string;

  @IsOptional()
  @IsIn(['hls', 'mjpeg', 'snapshot'])
  cameraType?: string;
}
