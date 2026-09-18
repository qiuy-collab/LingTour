import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Repository } from 'typeorm';
import { EmailSmtpSettings } from './entities/email-smtp-settings.entity';
import { EmailTemplate } from './entities/email-template.entity';
import {
  buildPreviewVars,
  getEmailEvent,
  renderEmailTemplate,
} from './email-events';

export interface ResolvedSmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useTls: boolean;
  source: 'database' | 'environment';
}

export interface SmtpCredentialsInput {
  host?: string;
  port?: number;
  username?: string;
  /** Empty/undefined keeps the stored password (DB value, then env). */
  password?: string;
  fromEmail?: string;
  fromName?: string;
  useTls?: boolean;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
}

const DEFAULT_FROM_EMAIL = 'Culvoy <no-reply@culvoy.com>';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    @InjectRepository(EmailSmtpSettings)
    private readonly smtpRepository: Repository<EmailSmtpSettings>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    private readonly configService: ConfigService,
  ) {}

  // ─── SMTP configuration resolution ────────────────────────────────

  private envValue(key: string): string {
    return (this.configService.get<string>(key) ?? '').trim();
  }

  private envPort(): number {
    const raw = Number(this.envValue('SMTP_PORT'));
    return Number.isFinite(raw) && raw > 0 ? raw : 587;
  }

  /**
   * Field-by-field merge: the env values are the base, the database row (if
   * any) overrides every non-empty column. A NULL/empty database password
   * falls back to the env password so saving a form with the password field
   * left blank never breaks delivery.
   */
  async resolveSmtpConfig(
    overrides?: SmtpCredentialsInput,
  ): Promise<ResolvedSmtpConfig | null> {
    const row = await this.smtpRepository.findOne({
      where: { scope: 'default' },
    });

    const pick = (
      dbValue: string | null | undefined,
      envValue: string,
      override?: string,
    ): string => {
      if (override !== undefined && override !== null && override !== '') {
        return override.trim();
      }
      if (dbValue !== undefined && dbValue !== null && dbValue !== '') {
        return dbValue;
      }
      return envValue;
    };

    const dbPort = row?.port && row.port > 0 ? row.port : null;
    const port =
      overrides?.port && overrides.port > 0
        ? overrides.port
        : (dbPort ?? this.envPort());

    const config: ResolvedSmtpConfig = {
      host: pick(row?.host, this.envValue('SMTP_HOST'), overrides?.host),
      port,
      username: pick(
        row?.username,
        this.envValue('SMTP_USER'),
        overrides?.username,
      ),
      // Special case: an empty override means "keep the stored password",
      // so the override must NOT bypass the DB value here.
      password: pick(
        row?.password,
        this.envValue('SMTP_PASS'),
        overrides?.password,
      ),
      fromEmail: pick(
        row?.fromEmail,
        this.envValue('SMTP_FROM') || DEFAULT_FROM_EMAIL,
        overrides?.fromEmail,
      ),
      fromName: pick(row?.fromName, '', overrides?.fromName),
      useTls:
        overrides?.useTls !== undefined
          ? overrides.useTls
          : (row?.useTls ?? true),
      source: row ? 'database' : 'environment',
    };

    if (!config.host || !config.username || !config.password) {
      return null;
    }
    return config;
  }

  private createTransport(config: ResolvedSmtpConfig): Transporter {
    const secure = config.useTls && config.port === 465;
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure,
      // useTls=false explicitly opts out of STARTTLS upgrades on ports
      // like 25/587 (e.g. local relays); nodemailer would otherwise try.
      ignoreTLS: !config.useTls,
      auth: { user: config.username, pass: config.password },
    });
  }

  private formatFrom(config: ResolvedSmtpConfig): string {
    if (config.fromName && config.fromEmail) {
      const escaped = config.fromName.replace(/["<>]/g, '');
      return `${escaped} <${config.fromEmail}>`;
    }
    if (config.fromEmail) {
      return config.fromEmail;
    }
    return DEFAULT_FROM_EMAIL;
  }

  // ─── Template rendering + delivery ────────────────────────────────

  /**
   * Renders one event's email: the **active** database template when present,
   * otherwise the built-in default. Draft values (unsaved editor content) win
   * over both, so an operator can verify exactly what a save would deliver.
   *
   * The `isActive: true` filter is shared with the admin preview on purpose —
   * a switched-off template must not appear in either place.
   *
   * Only the caller-supplied variables are rendered; a missing variable
   * becomes an empty placeholder, never the preview example value.
   */
  private async renderEventEmail(
    eventKey: string,
    vars: Record<string, string | number | undefined | null>,
    locale = 'en',
    draft?: { subject?: string; bodyHtml?: string },
  ): Promise<{ subject: string; text: string; html: string } | null> {
    const definition = getEmailEvent(eventKey);
    if (!definition) {
      return null;
    }

    let subject = definition.defaultSubject;
    let bodyHtml = definition.defaultBodyHtml;
    const stored = await this.templateRepository.findOne({
      where: { eventKey, locale, isActive: true },
    });
    if (stored) {
      subject = stored.subject || subject;
      bodyHtml = stored.bodyHtml || bodyHtml;
    }
    if (draft?.subject !== undefined) {
      subject = draft.subject;
    }
    if (draft?.bodyHtml !== undefined) {
      bodyHtml = draft.bodyHtml;
    }

    const mergedVars: Record<string, string | number | undefined | null> = {
      siteName: 'Culvoy',
      ...vars,
    };
    const html = renderEmailTemplate(bodyHtml, mergedVars);
    return {
      subject: renderEmailTemplate(subject, mergedVars),
      html,
      text: html.replace(/<[^>]+>/g, ' '),
    };
  }

  /**
   * Renders the event template and sends it. Returns false on any failure so
   * callers keep their existing delivery-fallback semantics.
   */
  async sendTemplated(
    eventKey: string,
    to: string,
    vars: Record<string, string | number | undefined | null>,
    locale = 'en',
  ): Promise<boolean> {
    const rendered = await this.renderEventEmail(eventKey, vars, locale);
    if (!rendered) {
      this.logger.error(`Unknown email event: ${eventKey}`);
      return false;
    }

    const config = await this.resolveSmtpConfig();
    if (!config) {
      return false;
    }

    try {
      const transporter = this.createTransport(config);
      await transporter.sendMail({
        from: this.formatFrom(config),
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send "${eventKey}" email to ${to}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  // ─── Admin test helpers ───────────────────────────────────────────

  async verifyConnection(
    overrides?: SmtpCredentialsInput,
  ): Promise<ConnectionTestResult> {
    const config = await this.resolveSmtpConfig(overrides);
    if (!config) {
      return {
        ok: false,
        message:
          'SMTP 配置不完整：主机、用户名和密码均不能为空（数据库与环境变量中都没有有效值）。',
      };
    }
    try {
      await this.createTransport(config).verify();
      return {
        ok: true,
        message: `连接成功：${config.host}:${config.port}（来源：${config.source === 'database' ? '数据库配置' : '环境变量'}）`,
      };
    } catch (error) {
      return {
        ok: false,
        message: `连接失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * SMTP connectivity probe. The body is hardcoded on purpose: it answers
   * "does this relay deliver at all?", a different question from "what does a
   * traveller actually receive?" — for the latter use `sendEventTestEmail`.
   */
  async sendTestEmail(
    to: string,
    overrides?: SmtpCredentialsInput,
  ): Promise<ConnectionTestResult> {
    const config = await this.resolveSmtpConfig(overrides);
    if (!config) {
      return {
        ok: false,
        message:
          'SMTP 配置不完整：主机、用户名和密码均不能为空（数据库与环境变量中都没有有效值）。',
      };
    }
    try {
      await this.createTransport(config).sendMail({
        from: this.formatFrom(config),
        to,
        subject: 'Culvoy SMTP test email',
        text: 'This is a test email sent from the Culvoy admin email settings page. If you received it, your SMTP configuration works.',
        html: `<div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1f2933;">
  <div style="border-bottom: 2px solid #236554; padding-bottom: 16px; margin-bottom: 24px;">
    <span style="font-size: 20px; font-weight: 700; color: #236554; letter-spacing: 0.08em;">CULVOY</span>
  </div>
  <h1 style="font-size: 20px; margin: 0 0 16px;">SMTP test email</h1>
  <p style="margin: 0 0 16px; line-height: 1.6;">This is a test email sent from the Culvoy admin email settings page. If you received it, your SMTP configuration works.</p>
  <p style="margin: 0; line-height: 1.6; color: #52606d;">Server: ${config.host}:${config.port}</p>
</div>`,
      });
      return { ok: true, message: `测试邮件已发送至 ${to}，请查收。` };
    } catch (error) {
      return {
        ok: false,
        message: `发送失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Event-level test send: renders the same template the real send site would
   * use — active database template first, built-in default otherwise — filled
   * with the event's example variables, and delivers it through the resolved
   * transport. This is the only path that shows an operator what a traveller
   * actually receives; the hardcoded `sendTestEmail` probe cannot.
   *
   * Unsaved editor drafts (`draft`) can be tested before saving, matching the
   * preview behaviour.
   */
  async sendEventTestEmail(
    eventKey: string,
    to: string,
    overrides?: SmtpCredentialsInput,
    draft?: { subject?: string; bodyHtml?: string },
  ): Promise<ConnectionTestResult> {
    const definition = getEmailEvent(eventKey);
    if (!definition) {
      return { ok: false, message: `未知邮件事件：${eventKey}` };
    }

    const config = await this.resolveSmtpConfig(overrides);
    if (!config) {
      return {
        ok: false,
        message:
          'SMTP 配置不完整：主机、用户名和密码均不能为空（数据库与环境变量中都没有有效值）。',
      };
    }

    const rendered = await this.renderEventEmail(
      eventKey,
      buildPreviewVars(definition),
      'en',
      draft,
    );
    if (!rendered) {
      return { ok: false, message: `未知邮件事件：${eventKey}` };
    }

    try {
      await this.createTransport(config).sendMail({
        from: this.formatFrom(config),
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      });
      return {
        ok: true,
        message: `已按「${definition.label}」事件模板发送测试邮件至 ${to}，请查收。`,
      };
    } catch (error) {
      return {
        ok: false,
        message: `发送失败：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
