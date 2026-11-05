import { ApiProperty } from '@nestjs/swagger';

export class UnitDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;
}
