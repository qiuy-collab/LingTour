import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
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
