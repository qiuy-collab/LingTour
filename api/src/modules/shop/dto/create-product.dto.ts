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
} from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';

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

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

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
