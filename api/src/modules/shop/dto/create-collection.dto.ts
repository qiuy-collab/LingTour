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
import { IsMediaLibraryPath } from '../../../common/validators/media-library.validator';

export class CreateCollectionDto {
  @ApiProperty({ example: 'coastal-life-kit' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Coastal Life Kit' })
  @IsString()
  title: string;

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

  @ApiProperty({ example: 'Curated objects from the Zhanjiang coast...' })
  @IsString()
  body: string;

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
