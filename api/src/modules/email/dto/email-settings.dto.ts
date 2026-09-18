import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * SMTP form values. Every field is optional because the admin may submit a
 * partial form (e.g. only the password for a connection test) — missing
 * fields fall back to the stored configuration, and an empty password keeps
 * the existing one instead of wiping it.
 */
export class SaveSmtpSettingsDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  host?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  username?: string;

  /** Empty string / omitted = keep the stored password. */
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  password?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsBoolean()
  useTls?: boolean;
}

export class TestSmtpConnectionDto extends SaveSmtpSettingsDto {}

/**
 * SMTP connectivity probe: a hardcoded message that proves the relay accepts
 * and delivers mail. It deliberately does NOT use an event template — use
 * `SendEventTestEmailDto` to verify what a traveller actually receives.
 */
export class SendTestEmailDto extends SaveSmtpSettingsDto {
  @IsEmail()
  to!: string;
}

/**
 * Event-level test send: renders the real event template (active database
 * template first, built-in default otherwise) and delivers it. Optional draft
 * fields let an unsaved edit be verified before it is stored. Draft values are
 * only forwarded when present, so an omitted field keeps the stored/default
 * content rather than blanking it.
 */
export class SendEventTestEmailDto extends SaveSmtpSettingsDto {
  @IsEmail()
  to!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  bodyHtml?: string;
}

export class SaveEmailTemplateDto {
  @IsIn(['en'])
  locale!: string;

  // `@Length(1, …)` rejects empty strings but lets `'   '` through, and
  // `saveTemplate` stores the body untrimmed — a whitespace-only template
  // would then override the built-in default and mail a near-empty body.
  @IsString()
  @Length(1, 255)
  @Matches(/\S/, { message: '邮件主题不能只包含空白字符' })
  subject!: string;

  @IsString()
  @Length(1, 100_000)
  @Matches(/\S/, { message: '邮件正文不能只包含空白字符' })
  bodyHtml!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PreviewEmailTemplateDto {
  @IsOptional()
  @IsIn(['en'])
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  bodyHtml?: string;

  @IsOptional()
  @IsObject()
  vars?: Record<string, string>;
}
