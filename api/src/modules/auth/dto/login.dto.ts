import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@lingtour.cn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'LingTour2026!' })
  @IsString()
  @MinLength(6)
  password: string;
}
