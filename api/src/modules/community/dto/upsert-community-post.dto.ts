import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  COMMUNITY_POST_STATUSES,
  type CommunityPostStatus,
} from '../entities/community-post.entity';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class UpsertCommunityPostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  channel: string;

  @ApiPropertyOptional({
    enum: COMMUNITY_POST_STATUSES,
    default: 'published',
    description:
      '管理后台创建时可指定；公开提交端点会忽略此字段并强制 pending_review',
  })
  @IsOptional()
  @IsIn(COMMUNITY_POST_STATUSES)
  status?: CommunityPostStatus;

  @ApiProperty({ type: Object })
  @IsObject()
  user: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  userEmail?: string;

  @ApiProperty({ type: Object })
  @IsObject()
  title: { en: string; zh: string };

  @ApiProperty({ type: Object })
  @IsObject()
  excerpt: { en: string; zh: string };

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsMediaLibraryPath()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  likes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  comments?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  saves?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
