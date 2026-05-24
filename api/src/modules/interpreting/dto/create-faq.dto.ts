import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';

export class CreateFaqDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: { en: 'Is this a tour guide service?', zh: '这是导游服务吗？' } })
  @IsI18nObject()
  question: { en: string; zh: string };

  @ApiProperty({ example: { en: 'It is designed as cultural interpreting...', zh: '它被设计为文化口译...' } })
  @IsI18nObject()
  answer: { en: string; zh: string };
}
