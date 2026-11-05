import { IsString, IsOptional } from 'class-validator';

export class UpdateManufacturerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
