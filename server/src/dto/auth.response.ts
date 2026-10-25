import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.response';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: () => UserDto })
  user: UserDto;
}
