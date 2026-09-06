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
  registerDecorator,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsI18nObject,
  IsI18nArray,
} from '../../../common/validators/i18n.validator';
import { MediaAssetDto } from '../../../common/dto/media-asset.dto';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

// City metadata is authored in English; omitted legacy translations are retained.
export type CityTextInput = { en: string; zh?: string };

function IsCityText() {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCityText',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
          }
          const text = value as CityTextInput;
          return (
            typeof text.en === 'string' &&
            (text.zh === undefined || typeof text.zh === 'string')
          );
        },
        defaultMessage: () =>
          `${propertyName} must be { en: string, zh?: string }`,
      },
    });
  };
}

export class CreateSectionDto {
  @ApiProperty({ example: { en: 'Southern coast', zh: '南部海岸' } })
  @IsI18nObject({ message: 'Section title must be { en: string, zh: string }' })
  title: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'Zhanjiang is famous...', zh: '湛江以...闻名' },
  })
  @IsI18nObject({ message: 'Section body must be { en: string, zh: string }' })
  body: { en: string; zh: string };

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
  @IsMediaLibraryPath()
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
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: { en: 'Guangzhou' } })
  @IsCityText()
  name: CityTextInput;

  @ApiPropertyOptional({ example: { en: 'Bay Area Core' } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsCityText()
  regionLabel?: CityTextInput;

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

  @ApiPropertyOptional({ example: { en: 'Guangzhou, the starting point...' } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsCityText()
  heroNarrative?: CityTextInput;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsI18nArray()
  tags?: { en: string; zh: string }[];

  @ApiPropertyOptional({ example: { en: '## Guangzhou: A River City\n\n...' } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsCityText()
  editorIntro?: CityTextInput;

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

  @ApiPropertyOptional({ example: { en: 'Flavours of Guangzhou' } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsCityText()
  foodTitle?: CityTextInput;

  @ApiPropertyOptional({ example: { en: 'Dim sum, roast goose...' } })
  @ValidateIf((_object, value) => value !== undefined)
  @IsCityText()
  foodDescription?: CityTextInput;

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
