import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsI18nObject,
  IsI18nArray,
} from '../../../common/validators/i18n.validator';

export class CreateSectionDto {
  @ApiProperty({ example: { en: 'Southern coast', zh: '南部海岸' } })
  @IsI18nObject({ message: 'Section title must be { en: string, zh: string }' })
  title: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'Zhanjiang is famous...', zh: '湛江以...闻名' },
  })
  @IsI18nObject({ message: 'Section body must be { en: string, zh: string }' })
  body: { en: string; zh: string };

  @ApiProperty({ example: 'https://oss.lingtour.cn/cities/xxx.jpg' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ example: { en: 'Coastline', zh: '海岸线长度' } })
  @IsOptional()
  @IsI18nObject()
  statLabel?: { en: string; zh: string };

  @ApiPropertyOptional({ example: { en: '1,243 km', zh: '1,243 公里' } })
  @IsOptional()
  @IsI18nObject()
  statValue?: { en: string; zh: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  breathImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsI18nObject()
  breathQuote?: { en: string; zh: string };

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateCityDto {
  @ApiProperty({ example: 'guangzhou' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: { en: 'Guangzhou', zh: '广州' } })
  @IsI18nObject({ message: 'City name must be { en: string, zh: string }' })
  name: { en: string; zh: string };

  @ApiProperty({ example: { en: 'Bay Area Core', zh: '大湾区核心' } })
  @IsI18nObject({ message: 'Region label must be { en: string, zh: string }' })
  regionLabel: { en: string; zh: string };

  @ApiProperty({ example: 'https://oss.lingtour.cn/cities/gz-hero.jpg' })
  @IsString()
  heroImage: string;

  @ApiProperty({
    example: {
      en: 'Guangzhou, the starting point...',
      zh: '广州，海上丝绸之路的起点...',
    },
  })
  @IsI18nObject({
    message: 'Hero narrative must be { en: string, zh: string }',
  })
  heroNarrative: { en: string; zh: string };

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsI18nArray()
  tags?: { en: string; zh: string }[];

  @ApiProperty({
    example: {
      en: '## Guangzhou: A River City\n\n...',
      zh: '## 广州：河畔之城\n\n...',
    },
  })
  @IsI18nObject({ message: 'Editor intro must be { en: string, zh: string }' })
  editorIntro: { en: string; zh: string };

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  @ApiProperty({ example: { en: 'Flavours of Guangzhou', zh: '广州味道' } })
  @IsI18nObject({ message: 'Food title must be { en: string, zh: string }' })
  foodTitle: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'Dim sum, roast goose...', zh: '点心、烧鹅...' },
  })
  @IsI18nObject({
    message: 'Food description must be { en: string, zh: string }',
  })
  foodDescription: { en: string; zh: string };

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foodImages?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ type: [CreateSectionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}
