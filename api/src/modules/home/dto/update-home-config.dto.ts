import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpdateHomeConfigDto {
  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  hero?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  trustMetrics?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  entryCards?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  cultureHighlights?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  testimonials?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  featuredRouteSlugs?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  featuredProductSlugs?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  featuredCitySlugs?: string[];
}

