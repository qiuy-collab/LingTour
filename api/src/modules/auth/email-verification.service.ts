import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import {
  EmailVerificationCode,
  type EmailVerificationPurpose,
} from './entities/email-verification-code.entity';
import { UsersService } from '../users/users.service';

type SendCodeResult = {
  email: string;
  purpose: EmailVerificationPurpose;
  expiresInSeconds: number;
  delivery: 'email' | 'development';
  devCode?: string;
};

@Injectable()
export class EmailVerificationService {
  private readonly ttlSeconds = 10 * 60;
  private readonly maxAttempts = 5;
  private readonly maxSendsPerDay = 10;

  constructor(
    @InjectRepository(EmailVerificationCode)
    private readonly codeRepository: Repository<EmailVerificationCode>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async sendCode(
    emailInput: string,
    purpose: EmailVerificationPurpose,
  ): Promise<SendCodeResult> {
    const email = this.normalizeEmail(emailInput);

    // Anti-enumeration (report P2-2): for login, an unknown email gets the
    // exact same 200 response as a known one — no code is stored, no mail
    // is sent, and the shape of the response does not differ.
    if (purpose === 'login') {
      const existing = await this.usersService.findByEmail(email);
      if (!existing || existing.status !== 'active') {
        return {
          email,
          purpose,
          expiresInSeconds: this.ttlSeconds,
          delivery: 'email',
        };
      }
    }

    await this.assertPurposeAllowed(email, purpose);
    await this.assertSendRateLimit(email);

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

    await this.codeRepository.update(
      { email, purpose, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const record = this.codeRepository.create({
      email,
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt,
      consumedAt: null,
      attempts: 0,
    });
    await this.codeRepository.save(record);

    const delivered = await this.sendEmail(email, code, purpose);
    if (!delivered && this.isProduction()) {
      // In production a missing/broken SMTP setup must fail loudly: falling
      // back to a "development" response would hand the plaintext code to
      // any caller and turn email-code login into an authentication bypass.
      throw new ServiceUnavailableException(
        'Email delivery is temporarily unavailable. Please try again later.',
      );
    }
    return {
      email,
      purpose,
      expiresInSeconds: this.ttlSeconds,
      delivery: delivered ? 'email' : 'development',
      ...(delivered ? {} : { devCode: code }),
    };
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Per-email send throttling on top of the IP throttler: one code per
   * minute and at most ten per day, so an attacker cannot flood a victim's
   * inbox or repeatedly invalidate the code the victim is typing.
   */
  private async assertSendRateLimit(email: string) {
    const minuteAgo = new Date(Date.now() - 60_000);
    const sentLastMinute = await this.codeRepository.count({
      where: { email, createdAt: MoreThan(minuteAgo) },
    });
    if (sentLastMinute > 0) {
      throw new HttpException(
        'A verification code was sent recently. Please wait a minute before requesting another.',
        429,
      );
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60_000);
    const sentLastDay = await this.codeRepository.count({
      where: { email, createdAt: MoreThan(dayAgo) },
    });
    if (sentLastDay >= this.maxSendsPerDay) {
      throw new HttpException(
        'Too many verification codes requested for this email. Try again later.',
        429,
      );
    }
  }

  async consumeCode(
    emailInput: string,
    purpose: EmailVerificationPurpose,
    code: string,
  ) {
    const email = this.normalizeEmail(emailInput);
    const record = await this.codeRepository.findOne({
      where: {
        email,
        purpose,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new UnauthorizedException('Verification code is invalid or expired');
    }
    if (record.attempts >= this.maxAttempts) {
      record.consumedAt = new Date();
      await this.codeRepository.save(record);
      throw new UnauthorizedException('Verification code is invalid or expired');
    }

    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) {
      // Increment attempts atomically: a read-modify-write would let N
      // concurrent wrong guesses each save the same stale value and blow
      // far past maxAttempts. When the conditional update matches no row
      // the budget is exhausted, so consume the code and reject.
      const result = await this.codeRepository.update(
        { id: record.id, attempts: LessThan(this.maxAttempts) },
        { attempts: () => 'attempts + 1' },
      );
      if ((result.affected ?? 0) === 0) {
        await this.codeRepository.update(
          { id: record.id, consumedAt: IsNull() },
          { consumedAt: new Date() },
        );
      }
      throw new UnauthorizedException('Verification code is invalid or expired');
    }

    record.consumedAt = new Date();
    await this.codeRepository.save(record);
    return { email, purpose };
  }

  private async assertPurposeAllowed(
    email: string,
    purpose: EmailVerificationPurpose,
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (purpose === 'signup' && existing) {
      throw new ConflictException('This email is already in use');
    }
    if (purpose === 'change_email' && existing) {
      // The caller is a signed-in account picking a NEW address, so an
      // occupied target is a hard conflict, not an enumeration concern.
      throw new ConflictException('This email is already in use');
    }
    if (purpose === 'login' && existing && existing.status !== 'active') {
      throw new UnauthorizedException('This account is disabled');
    }
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async sendEmail(
    email: string,
    code: string,
    purpose: EmailVerificationPurpose,
  ): Promise<boolean> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      'Culvoy <no-reply@culvoy.com>';

    if (!host || !user || !pass) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const action = purpose === 'signup' ? 'create your Culvoy account' : 'log in to Culvoy';
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your Culvoy verification code',
      text: `Use ${code} to ${action}. This code expires in 10 minutes.`,
      html: `<p>Use <strong>${code}</strong> to ${action}.</p><p>This code expires in 10 minutes.</p>`,
    });
    return true;
  }
}
