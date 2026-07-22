import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const STAFF_ROLES = ['admin', 'editor'] as const;
const USER_STATUSES = ['active', 'banned'] as const;
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class CreateStaffAccountDto {
  @ApiProperty({ example: 'editor@lingtour.cn' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD, {
    message:
      'password must contain uppercase, lowercase, and numeric characters',
  })
  password: string;

  @ApiProperty({ example: 'Content Editor' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: STAFF_ROLES, default: 'editor' })
  @IsIn(STAFF_ROLES)
  role: 'admin' | 'editor';

  @ApiPropertyOptional({ enum: USER_STATUSES, default: 'active' })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: 'active' | 'banned';
}
