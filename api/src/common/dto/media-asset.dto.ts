import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsI18nObject } from '../validators/i18n.validator';
import { MEDIA_TYPES, type MediaAsset, type MediaType } from '../types/media';

export class MediaAssetDto implements MediaAsset {
  @ApiProperty({ enum: MEDIA_TYPES, example: 'video' })
  @IsIn(MEDIA_TYPES)
  type: MediaType;

  @ApiProperty({ example: '/uploads/routes/arrival.mp4' })
  @IsString()
  @MaxLength(2000)
  url: string;

  @ApiPropertyOptional({ example: '/uploads/routes/arrival-poster.webp' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  poster?: string;

  @ApiPropertyOptional({ example: { en: 'Temple arrival', zh: '抵达古寺' } })
  @IsOptional()
  @IsI18nObject()
  alt?: { en: string; zh: string };
}
