import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsIn,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateModeDto {
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

  /**
   * P2-8: explicit deposit for this mode in minor units. Set an integer to
   * configure it, send null (or omit on create) to clear / leave unset —
   * bookings for modes without a deposit fall back to the legacy heuristic.
   */
  @ApiPropertyOptional({
    description: 'Deposit in minor units; null clears it',
    example: 12000,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000000)
  depositCents?: number | null;
}
