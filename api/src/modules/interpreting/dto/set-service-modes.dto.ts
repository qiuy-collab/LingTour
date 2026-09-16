import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  ArrayMinSize,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceModeItemDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({
    example: 'City companion interpreting',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'From RMB 680 / half day',
  })
  @IsString()
  price: string;

  @ApiProperty({
    example: 'Best for independent visitors',
  })
  @IsString()
  bestFor: string;

  @ApiProperty({
    example: 'For travelers who want...',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @ApiPropertyOptional({ default: 'light', enum: ['light', 'dark'] })
  @IsOptional()
  @IsIn(['light', 'dark'])
  accent?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class SetServiceModesDto {
  @ApiProperty({ type: [ServiceModeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceModeItemDto)
  service_modes: ServiceModeItemDto[];
}
