import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateProfileDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: 'Culture Route Lead' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'English / Mandarin / Cantonese',
  })
  @IsString()
  language: string;

  @ApiProperty({
    example: 'Guangdong city history...',
  })
  @IsString()
  focus: string;

  @ApiProperty({ default: [] })
  @IsArray()
  @IsString({ each: true })
  helps: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsMediaLibraryPath()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ example: 'Bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ default: 'pending_review' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;
}
