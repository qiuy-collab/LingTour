import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsUUID,
  Min,
  MaxLength,
  IsPositive,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateProductDto {
  @ApiProperty({ example: 'volcanic-soil-bowl' })
  @IsString()
  @MaxLength(120)
  slug: string;

  @ApiProperty({ example: 'Volcanic Soil Tea Bowl' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'uuid-of-collection' })
  @IsOptional()
  @IsUUID()
  collectionId?: string;

  @ApiProperty({ example: 32.0 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ default: 'SGD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Handcrafted' })
  @IsString()
  tag: string;

  @ApiProperty({ example: '/uploads/shop/bowl.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsMediaLibraryPath()
  image: string;

  @ApiPropertyOptional({ type: MediaAssetDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  primaryMedia?: MediaAssetDto;

  @ApiProperty({ example: 'A bowl fired using clay...' })
  @IsString()
  story: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  care?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  originTrace?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsMediaLibraryPath({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ type: [MediaAssetDto], default: [] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAssetDto)
  galleryMedia?: MediaAssetDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
