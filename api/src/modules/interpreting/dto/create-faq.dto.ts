import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';

export class CreateFaqDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: { en: 'Is this a tour guide service?', zh: '这是导览服务吗？' } })
  @IsI18nObject()
  question: { en: string; zh: string };

  @ApiProperty({ example: { en: 'It is designed as cultural interpreting...', zh: '它更接近文化解读与陪伴支持。' } })
  @IsI18nObject()
  answer: { en: string; zh: string };

  @ApiPropertyOptional({ default: 'interpreting' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;
}
