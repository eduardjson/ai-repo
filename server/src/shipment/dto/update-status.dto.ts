import { IsString, IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['PENDING', 'COMPLETED', 'CANCELLED'])
  status: string;
}
