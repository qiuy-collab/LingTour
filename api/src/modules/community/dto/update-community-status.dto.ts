import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateCommunityStatusDto {
  @ApiProperty({ example: 'published' })
  @IsString()
  @MaxLength(30)
  status: string;
}

