import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Server-relative media library path under /uploads/. Empty string clears the avatar.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsMediaLibraryPath({
    message: 'avatarUrl must reference a file under /uploads/',
  })
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @Matches(/^(?:|[A-Za-z]{2})$/, {
    message: 'country must be an ISO 3166-1 alpha-2 country code',
  })
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  homeBase?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  travelStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(600)
  bio?: string;

  @ApiPropertyOptional({ enum: ['public', 'community', 'private'] })
  @IsOptional()
  @IsString()
  @IsIn(['public', 'community', 'private'])
  profileVisibility?: 'public' | 'community' | 'private';
}
