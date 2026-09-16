import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  IsArray,
  IsNumber,
  MaxLength,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateStopDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Object)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @MaxLength(20)
  time: string;

  @ApiProperty({ example: 'Huguangyan Maar Lake' })
  @IsString()
  stopName: string;

  @ApiProperty({ example: 'Begin where the land remembers fire...' })
  @IsString()
  story: string;

  @ApiProperty({ example: 'Huguangyan formed roughly...' })
  @IsString()
  culturalStory: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  details?: string[];

  @ApiProperty({ example: '/uploads/routes/stop-0.jpg' })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hotel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transit?: string;

  @ApiPropertyOptional({ example: 'A full day exploring the coast...' })
  @IsOptional()
  @IsString()
  plan?: string;
}

export class CreateRouteDto {
  @ApiProperty({ example: 'southern-sea-table' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'A Southern Sea Table' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Coastal' })
  @IsString()
  @MaxLength(50)
  cultureTag: string;

  @ApiProperty({ example: 'Zhanjiang' })
  @IsString()
  cityName: string;

  @ApiProperty({ example: '1 day' })
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Curious travellers' })
  @IsString()
  audience: string;

  @ApiProperty({ example: 'From a pre-dawn seafood auction...' })
  @IsString()
  summary: string;

  @ApiProperty({ example: 'Most people meet Guangdong...' })
  @IsString()
  story: string;

  @ApiProperty({ example: '/uploads/routes/cover.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsMediaLibraryPath()
  coverImage: string;

  @ApiPropertyOptional({ example: 'southern-sea' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  routeRegionKey?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['zhanjiang'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  citySlugs?: string[];

  @ApiPropertyOptional({ type: [CreateStopDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops?: CreateStopDto[];
}
