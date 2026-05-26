import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsI18nObject, IsI18nArray } from '../../../common/validators/i18n.validator';

export class CreateProfileDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: { en: 'Culture Route Lead', zh: '文化路线领队' } })
  @IsI18nObject()
  name: { en: string; zh: string };

  @ApiProperty({ example: { en: 'English / Mandarin / Cantonese', zh: '英语/普通话/粤语' } })
  @IsI18nObject()
  language: { en: string; zh: string };

  @ApiProperty({ example: { en: 'Guangdong city history...', zh: '广东城市历史...' } })
  @IsI18nObject()
  focus: { en: string; zh: string };

  @ApiProperty({ default: [] })
  @IsI18nArray()
  helps: { en: string; zh: string }[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ example: { en: 'Bio', zh: '简介' } })
  @IsOptional()
  @IsI18nObject()
  bio?: { en: string; zh: string };

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
