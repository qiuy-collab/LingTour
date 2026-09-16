import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Southern coast' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Zhanjiang is famous...' })
  @IsString()
  body: string;

  @ApiProperty({ example: '/uploads/cities/section.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsMediaLibraryPath()
  image: string;

  @ApiPropertyOptional({ type: MediaAssetDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  primaryMedia?: MediaAssetDto;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsMediaLibraryPath({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [MediaAssetDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  media?: MediaAssetDto[];

  @ApiPropertyOptional({ example: 'Coastline' })
  @IsOptional()
  @IsString()
  statLabel?: string;

  @ApiPropertyOptional({ example: '1,243 km' })
  @IsOptional()
  @IsString()
  statValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsMediaLibraryPath()
  breathImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breathQuote?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateCityDto {
  @ApiProperty({ example: 'guangzhou' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Guangzhou' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Bay Area Core' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  regionLabel?: string;

  @ApiPropertyOptional({ example: '/uploads/cities/guangzhou-hero.jpg' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsMediaLibraryPath()
  heroImage?: string;

  @ApiPropertyOptional({ type: MediaAssetDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  heroMedia?: MediaAssetDto;

  @ApiPropertyOptional({ example: 'Guangzhou, the starting point...' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  heroNarrative?: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: '## Guangzhou: A River City\n\n...' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  editorIntro?: string;

  @ApiPropertyOptional({ default: '', maxLength: 200000 })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Object)
  @IsString()
  @MaxLength(200000)
  contentMarkdown?: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsMediaLibraryPath({ each: true })
  galleryImages?: string[];

  @ApiPropertyOptional({ type: [MediaAssetDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  galleryMedia?: MediaAssetDto[];

  @ApiPropertyOptional({ example: 'Flavours of Guangzhou' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  foodTitle?: string;

  @ApiPropertyOptional({ example: 'Dim sum, roast goose...' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  foodDescription?: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsMediaLibraryPath({ each: true })
  foodImages?: string[];

  @ApiPropertyOptional({ example: 440800 })
  @IsOptional()
  @IsInt()
  adcode?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ type: [CreateSectionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];

  @ApiPropertyOptional({ type: [String], example: ['southern-sea-table'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  routeSlugs?: string[];

  @ApiPropertyOptional({ type: [String], example: ['foshan', 'chaozhou'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedCitySlugs?: string[];
}
