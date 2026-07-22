import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';
import { ContainsOnlyMediaLibraryPaths } from '../../../common/validators/media-library.validator';

class RouteRegionConfigDto {
  @ApiPropertyOptional()
  @IsString()
  key: string;

  @ApiPropertyOptional({ type: Object })
  @IsI18nObject()
  title: { en: string; zh: string };

  @ApiPropertyOptional({ type: Object })
  @IsI18nObject()
  note: { en: string; zh: string };

  @ApiPropertyOptional({ type: [Number] })
  @IsArray()
  adcodes: number[];
}

export class UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  @ContainsOnlyMediaLibraryPaths()
  hero?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  trustMetrics?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ContainsOnlyMediaLibraryPaths()
  entryCards?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ContainsOnlyMediaLibraryPaths()
  cultureHighlights?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ContainsOnlyMediaLibraryPaths()
  testimonials?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  featuredRouteSlugs?: string[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteRegionConfigDto)
  routeRegions?: RouteRegionConfigDto[];
}
