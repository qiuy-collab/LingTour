import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}
