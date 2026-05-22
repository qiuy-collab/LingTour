import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertCommunityBriefDto {
  @ApiProperty({ description: '稳定 slug，用作 URL 与 React key' })
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/, {
    message:
      'slug must be lowercase alphanumerics and hyphens, 1-80 chars, no leading/trailing hyphen',
  })
  slug: string;

  @ApiProperty({ type: Object, description: '中英标题，例：{ en, zh }' })
  @IsObject()
  title: { en: string; zh: string };

  @ApiProperty({ type: Object, description: '中英 prompt 文案' })
  @IsObject()
  prompt: { en: string; zh: string };

  @ApiPropertyOptional({ default: 'Field Notes' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  channel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  route?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mood?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
