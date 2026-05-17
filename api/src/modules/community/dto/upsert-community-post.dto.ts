import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertCommunityPostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  channel: string;

  @ApiPropertyOptional({ default: 'published' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  status?: string;

  @ApiProperty({ type: Object })
  @IsObject()
  user: Record<string, unknown>;

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
}

