import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';
import { EVENT_STATUSES } from '../entities/event.entity';

export class CreateEventDto {
  @ApiProperty() @IsString() @MaxLength(120) slug: string;
  @ApiProperty({ type: Object }) @IsObject() title: { en: string; zh: string };
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() summary?: {
    en: string;
    zh: string;
  };
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  description?: { en: string; zh: string };
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() citySlug?: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsMediaLibraryPath()
  image?: string;
  @ApiPropertyOptional({ enum: EVENT_STATUSES })
  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: (typeof EVENT_STATUSES)[number];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  relatedRouteSlugs?: string[];
}
