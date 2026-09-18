import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Forgot-password step 1: ask for a reset code to be mailed to an address. */
export class ForgotPasswordDto {
  @ApiProperty({ example: 'traveller@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

/**
 * Forgot-password step 2: redeem the mailed code and set the new password.
 * The length floor matches registration, so a reset can never weaken an
 * account below the signup policy.
 */
export class ResetPasswordDto {
  @ApiProperty({ example: 'traveller@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: '482913' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ example: 'a-new-secret' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}