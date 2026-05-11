import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsI18nObject,
  IsI18nArray,
} from '../../../common/validators/i18n.validator';

export class ProfileItemDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;

  @ApiProperty({ example: { en: 'Culture Route Lead', zh: '文化路线领队' } })
  @IsI18nObject()
  name: { en: string; zh: string };

  @ApiProperty({
    example: {
      en: 'English / Mandarin / Cantonese support',
      zh: '英语/普通话/粤语支持',
    },
  })
  @IsI18nObject()
  language: { en: string; zh: string };

  @ApiProperty({
    example: { en: 'Guangdong city history...', zh: '广东城市历史...' },
  })
  @IsI18nObject()
  focus: { en: string; zh: string };

  @ApiProperty({ default: [] })
  @IsI18nArray()
  helps: { en: string; zh: string }[];
}

export class SetProfilesDto {
  @ApiProperty({ type: [ProfileItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileItemDto)
  profiles: ProfileItemDto[];
}
