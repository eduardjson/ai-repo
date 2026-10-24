import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class MessageTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text: string;
}
