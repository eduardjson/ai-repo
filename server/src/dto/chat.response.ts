import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  uploadedAt: string;
}

export class MessageUserDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  avatar?: string;

  @ApiPropertyOptional({ nullable: true })
  firstName?: string;

  @ApiPropertyOptional({ nullable: true })
  lastName?: string;

  @ApiPropertyOptional({ nullable: true })
  username?: string;
}

export class MessageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional({ type: () => MessageUserDto })
  user?: MessageUserDto;

  @ApiPropertyOptional({ type: () => [AttachmentDto] })
  attachments?: AttachmentDto[];
}
