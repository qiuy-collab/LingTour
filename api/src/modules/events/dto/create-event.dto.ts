import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty() @IsString() @MaxLength(120) slug: string;
  @ApiProperty({ type: Object }) @IsObject() title: { en: string; zh: string };
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() summary?: { en: string; zh: string };
  @ApiPropertyOptional({ type: Object }) @IsOptional() @IsObject() description?: { en: string; zh: string };
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() citySlug?: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() relatedRouteSlugs?: string[];
}
