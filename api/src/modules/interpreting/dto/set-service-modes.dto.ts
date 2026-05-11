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
import {
  IsI18nObject,
  IsI18nArray,
} from '../../../common/validators/i18n.validator';

export class ServiceModeItemDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({
    example: { en: 'City companion interpreting', zh: '城市同行口译' },
  })
  @IsI18nObject()
  title: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'From RMB 680 / half day', zh: '半天 RMB 680 起' },
  })
  @IsI18nObject()
  price: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'Best for independent visitors', zh: '适合独立游客' },
  })
  @IsI18nObject()
  bestFor: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'For travelers who want...', zh: '需要英语支持的旅客...' },
  })
  @IsI18nObject()
  body: { en: string; zh: string };

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsI18nArray()
  includes?: { en: string; zh: string }[];

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
