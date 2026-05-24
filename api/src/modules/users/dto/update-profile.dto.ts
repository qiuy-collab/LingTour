import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// Accept either a full http(s) URL or a server-relative upload path like
// `/uploads/avatars/<uuid>.png`. Empty string is also allowed so the client
// can clear an existing avatar.
const AVATAR_URL_REGEX =
  /^(?:|https?:\/\/[^\s]+|\/uploads\/[^\s]+)$/i;

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Either an absolute http(s) URL or a server-relative path under /uploads/. Empty string clears the avatar.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(AVATAR_URL_REGEX, {
    message: 'avatarUrl must be an http(s) URL or a path under /uploads/',
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
