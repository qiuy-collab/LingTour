import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ContainsOnlyMediaLibraryPaths } from '../../../common/validators/media-library.validator';

class RouteRegionConfigDto {
  @ApiPropertyOptional()
  @IsString()
  key: string;

  @ApiPropertyOptional({ type: Object })
  @IsString()
  title: string;

  @ApiPropertyOptional({ type: Object })
  @IsString()
  note: string;

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

  // @Type(() => Object) keeps free-form object arrays intact while request
  // scalar validation remains strict.
  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  trustMetrics?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  @ContainsOnlyMediaLibraryPaths()
  entryCards?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
  @ContainsOnlyMediaLibraryPaths()
  cultureHighlights?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @Type(() => Object)
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
