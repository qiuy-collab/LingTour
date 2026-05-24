import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  /**
   * The Google id_token (credential) returned by Google Sign-In.
   * The server verifies this token cryptographically before trusting
   * the email/name claims inside it.
   */
  @IsString()
  credential: string;

  /** Optional display name override (used only for new accounts). */
  @IsOptional()
  @IsString()
  name?: string;
}
