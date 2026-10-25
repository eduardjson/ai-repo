import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from './enums';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  username?: string;

  @ApiPropertyOptional({ nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ nullable: true })
  phone?: string;

  @ApiProperty({ enum: Role, isArray: true })
  role: Role[];

  @ApiPropertyOptional({ nullable: true })
  avatar?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
