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
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsI18nObject,
  IsI18nArray,
} from '../../../common/validators/i18n.validator';

export class CreateStopDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @MaxLength(20)
  time: string;

  @ApiProperty({ example: { en: 'Huguangyan Maar Lake', zh: '湖光岩玛珥湖' } })
  @IsI18nObject()
  stopName: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'Begin where the land remembers fire...',
      zh: '从大地记住火的地方开始...',
    },
  })
  @IsI18nObject()
  story: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'Huguangyan formed roughly...',
      zh: '湖光岩形成于约16万年前...',
    },
  })
  @IsI18nObject()
  culturalStory: { en: string; zh: string };

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsI18nArray()
  details?: { en: string; zh: string }[];

  @ApiProperty({ example: 'https://oss.lingtour.cn/routes/stop-0.jpg' })
  @IsString()
  image: string;

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
  @IsI18nObject()
  meal?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  hotel?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  transit?: { en: string; zh: string };
}

export class CreateRouteDto {
  @ApiProperty({ example: 'southern-sea-table' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: { en: 'A Southern Sea Table', zh: '南部海宴' } })
  @IsI18nObject()
  title: { en: string; zh: string };

  @ApiProperty({ example: 'Coastal' })
  @IsString()
  @MaxLength(50)
  cultureTag: string;

  @ApiProperty({ example: { en: 'Zhanjiang', zh: '湛江' } })
  @IsI18nObject()
  cityName: { en: string; zh: string };

  @ApiProperty({ example: { en: '1 day', zh: '1 天' } })
  @IsI18nObject()
  duration: { en: string; zh: string };

  @ApiProperty({ example: { en: 'Curious travellers', zh: '好奇的旅行者' } })
  @IsI18nObject()
  audience: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'From a pre-dawn seafood auction...',
      zh: '从黎明前的海鲜拍卖...',
    },
  })
  @IsI18nObject()
  summary: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'Most people meet Guangdong...',
      zh: '大多数人通过城市认识广东...',
    },
  })
  @IsI18nObject()
  story: { en: string; zh: string };

  @ApiProperty({ example: 'https://oss.lingtour.cn/routes/cover.jpg' })
  @IsString()
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
