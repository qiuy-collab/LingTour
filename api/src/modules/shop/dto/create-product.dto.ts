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
} from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'volcanic-soil-bowl' })
  @IsString()
  @MaxLength(120)
  slug: string;

  @ApiProperty({ example: { en: 'Volcanic Soil Tea Bowl', zh: '火山泥茶杯' } })
  @IsI18nObject()
  name: { en: string; zh: string };

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

  @ApiProperty({ example: { en: 'Handcrafted', zh: '手工制作' } })
  @IsI18nObject()
  tag: { en: string; zh: string };

  @ApiProperty({ example: 'https://oss.lingtour.cn/shop/bowl.jpg' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ type: MediaAssetDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaAssetDto)
  primaryMedia?: MediaAssetDto;

  @ApiProperty({
    example: { en: 'A bowl fired using clay...', zh: '使用黏土烧制的碗...' },
  })
  @IsI18nObject()
  story: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  material?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  dimensions?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  origin?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  care?: { en: string; zh: string };

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  originTrace?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
