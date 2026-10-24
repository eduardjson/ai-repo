import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  config: object;
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  config: object;
}
