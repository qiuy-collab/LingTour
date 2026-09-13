import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import type { EmailVerificationPurpose } from '../entities/email-verification-code.entity';

export class VerifyEmailCodeDto {
  @ApiProperty({ example: 'traveler@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '248613' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ enum: ['login', 'signup'] })
  @IsIn(['login', 'signup'])
  purpose: EmailVerificationPurpose;

  @ApiPropertyOptional({ example: 'Maya Chen' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
