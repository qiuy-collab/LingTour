import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { IsI18nObject } from '../../../common/validators/i18n.validator';
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'coastal-life-kit' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: { en: 'Coastal Life Kit', zh: '海岸生活套装' } })
  @IsI18nObject()
  title: { en: string; zh: string };

  @ApiProperty({ example: 'A Southern Sea Table' })
  @IsString()
  @MaxLength(200)
  routeName: string;

  @ApiPropertyOptional({ default: '' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  routeSlug?: string;

  @ApiProperty({ example: '/uploads/shop/coastal-cover.jpg' })
  @IsString()
  @IsNotEmpty()
  @IsMediaLibraryPath()
  image: string;

  @ApiProperty({
    example: {
      en: 'Curated objects from the Zhanjiang coast...',
      zh: '来自湛江海岸的精选物品...',
    },
  })
  @IsI18nObject()
  body: { en: string; zh: string };

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
