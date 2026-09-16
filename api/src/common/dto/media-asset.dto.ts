import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsMediaLibraryPath } from '../validators/media-library.validator';
import { MEDIA_TYPES, type MediaAsset, type MediaType } from '../types/media';

export class MediaAssetDto implements MediaAsset {
  @ApiProperty({ enum: MEDIA_TYPES, example: 'video' })
  @IsIn(MEDIA_TYPES)
  type: MediaType;

  @ApiProperty({ example: '/uploads/routes/arrival.mp4' })
  @IsString()
  @IsNotEmpty()
  @IsMediaLibraryPath()
  @MaxLength(2000)
  url: string;

  @ApiPropertyOptional({ example: '/uploads/routes/arrival-poster.webp' })
  @IsOptional()
  @IsString()
  @IsMediaLibraryPath()
  @MaxLength(2000)
  poster?: string;

  @ApiPropertyOptional({ example: 'Temple arrival' })
  @IsOptional()
  @IsString()
  alt?: string;
}
