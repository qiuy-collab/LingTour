import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSmtpSettings } from './entities/email-smtp-settings.entity';
import { EmailTemplate } from './entities/email-template.entity';
import {
  EMAIL_EVENTS,
  buildPreviewVars,
  getEmailEvent,
  renderEmailTemplate,
} from './email-events';
import {
  MailerService,
  SmtpCredentialsInput,
} from './mailer.service';
import {
  PreviewEmailTemplateDto,
  SaveEmailTemplateDto,
  SaveSmtpSettingsDto,
  SendEventTestEmailDto,
} from './dto/email-settings.dto';

/**
 * Masked SMTP view for the admin form. The password never leaves the API —
 * only a boolean and its origin — so refreshing the page can never leak it
 * and the form's empty password field means "keep what is stored".
 */
export interface SmtpSettingsView {
  host: string;
  port: number;
  username: string;
  fromEmail: string;
  fromName: string;
  useTls: boolean;
  hasPassword: boolean;
  passwordSource: 'database' | 'environment' | 'none';
  source: 'database' | 'environment';
}

export interface TemplateEventView {
  key: string;
  label: string;
  description: string;
  status: 'active' | 'planned';
  variables: { key: string; label: string; example: string }[];
  defaultSubject: string;
  defaultBodyHtml: string;
  templates: Record<
    string,
    { subject: string; bodyHtml: string; isActive: boolean; updatedAt: string }
  >;
}

/**
 * Rendered preview of one event template. `source` records where the shown
 * content came from; `storedDisabled` is true when a saved template exists but
 * is switched off — real delivery ignores such a template and falls back to the
 * built-in default, and this preview does exactly the same.
 */
export interface TemplatePreviewView {
  subject: string;
  bodyHtml: string;
  source: 'draft' | 'stored' | 'default';
  storedDisabled: boolean;
}

@Injectable()
export class EmailAdminService {
  constructor(
    @InjectRepository(EmailSmtpSettings)
    private readonly smtpRepository: Repository<EmailSmtpSettings>,
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    private readonly mailerService: MailerService,
  ) {}

  // ─── SMTP settings ────────────────────────────────────────────────

  async getSmtpView(): Promise<SmtpSettingsView> {
    const resolved = await this.mailerService.resolveSmtpConfig();
    const row = await this.smtpRepository.findOne({
      where: { scope: 'default' },
    });

    if (!resolved) {
      // Nothing usable anywhere — return blank form values so the admin
      // starts from an honest empty state, never from example defaults.
      return {
        host: '',
        port: 587,
        username: '',
        fromEmail: '',
        fromName: '',
        useTls: true,
        hasPassword: false,
        passwordSource: 'none',
        source: row ? 'database' : 'environment',
      };
    }

    const dbPassword = row?.password?.trim() ?? '';
    return {
      host: resolved.host,
      port: resolved.port,
      username: resolved.username,
      fromEmail: resolved.fromEmail,
      fromName: resolved.fromName,
      useTls: resolved.useTls,
      hasPassword: true,
      passwordSource: dbPassword ? 'database' : 'environment',
      source: resolved.source,
    };
  }

  async saveSmtpSettings(dto: SaveSmtpSettingsDto): Promise<SmtpSettingsView> {
    let row = await this.smtpRepository.findOne({
      where: { scope: 'default' },
    });
    if (!row) {
      row = this.smtpRepository.create({ scope: 'default' });
    }

    if (dto.host !== undefined) row.host = dto.host.trim();
    if (dto.port !== undefined) row.port = dto.port;
    if (dto.username !== undefined) row.username = dto.username.trim();
    if (dto.fromEmail !== undefined) row.fromEmail = dto.fromEmail.trim();
    if (dto.fromName !== undefined) row.fromName = dto.fromName.trim();
    if (dto.useTls !== undefined) row.useTls = dto.useTls;
    // Empty password = keep the existing one (report requirement). Only a
    // non-empty value overwrites the stored secret.
    if (dto.password !== undefined && dto.password !== '') {
      row.password = dto.password;
    }

    await this.smtpRepository.save(row);
    return this.getSmtpView();
  }

  async testSmtpConnection(
    dto: SaveSmtpSettingsDto,
  ): Promise<{ ok: boolean; message: string }> {
    return this.mailerService.verifyConnection(
      dto as SmtpCredentialsInput,
    );
  }

  async sendTestEmail(
    dto: SaveSmtpSettingsDto & { to: string },
  ): Promise<{ ok: boolean; message: string }> {
    const { to, ...credentials } = dto;
    return this.mailerService.sendTestEmail(to, credentials);
  }

  /**
   * Event-level test send: renders the real event template and delivers it, so
   * an operator can verify traveller-facing output. Draft subject/body are only
   * forwarded when present, so an omitted field keeps the stored/default
   * content instead of blanking it.
   */
  async sendEventTestEmail(
    eventKey: string,
    dto: SendEventTestEmailDto,
  ): Promise<{ ok: boolean; message: string }> {
    const { to, subject, bodyHtml, ...credentials } = dto;
    const draft: { subject?: string; bodyHtml?: string } = {};
    if (subject !== undefined) draft.subject = subject;
    if (bodyHtml !== undefined) draft.bodyHtml = bodyHtml;
    return this.mailerService.sendEventTestEmail(
      eventKey,
      to,
      credentials,
      draft,
    );
  }

  // ─── Email templates ──────────────────────────────────────────────

  async listTemplateEvents(): Promise<{ events: TemplateEventView[] }> {
    const stored = await this.templateRepository.find();
    const byKeyLocale = new Map<string, EmailTemplate>();
    for (const template of stored) {
      byKeyLocale.set(`${template.eventKey}::${template.locale}`, template);
    }

    const events = EMAIL_EVENTS.map((definition) => {
      const templates: TemplateEventView['templates'] = {};
      const template = byKeyLocale.get(`${definition.key}::en`);
      if (template) {
        templates.en = {
          subject: template.subject,
          bodyHtml: template.bodyHtml,
          isActive: template.isActive,
          updatedAt: template.updatedAt.toISOString(),
        };
      }
      return {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        status: definition.status,
        variables: definition.variables,
        defaultSubject: definition.defaultSubject,
        defaultBodyHtml: definition.defaultBodyHtml,
        templates,
      };
    });
    return { events };
  }

  async saveTemplate(
    eventKey: string,
    dto: SaveEmailTemplateDto,
  ): Promise<TemplateEventView> {
    const definition = getEmailEvent(eventKey);
    if (!definition) {
      throw new NotFoundException(`Unknown email event: ${eventKey}`);
    }
    if (dto.locale !== 'en') {
      // The content contract is English-only; the locale axis exists so the
      // schema is multi-language ready, but non-English values are rejected
      // until the product actually ships another locale.
      throw new BadRequestException('Only the "en" locale is supported');
    }

    let template = await this.templateRepository.findOne({
      where: { eventKey, locale: dto.locale },
    });
    if (!template) {
      template = this.templateRepository.create({
        eventKey,
        locale: dto.locale,
      });
    }
    template.subject = dto.subject.trim();
    template.bodyHtml = dto.bodyHtml;
    template.isActive = dto.isActive ?? true;
    await this.templateRepository.save(template);

    const { events } = await this.listTemplateEvents();
    return events.find((event) => event.key === eventKey)!;
  }

  async previewTemplate(
    eventKey: string,
    dto: PreviewEmailTemplateDto,
  ): Promise<TemplatePreviewView> {
    const definition = getEmailEvent(eventKey);
    if (!definition) {
      throw new NotFoundException(`Unknown email event: ${eventKey}`);
    }
    const locale = dto.locale ?? 'en';

    let subject = definition.defaultSubject;
    let bodyHtml = definition.defaultBodyHtml;
    let source: TemplatePreviewView['source'] = 'default';

    const stored = await this.templateRepository.findOne({
      where: { eventKey, locale },
    });
    // A switched-off template is never used for real delivery (see
    // MailerService.renderEventEmail, which filters on isActive), so the
    // preview must not show it either — otherwise the admin sees content that
    // no traveller will ever receive.
    if (stored && stored.isActive) {
      subject = stored.subject || subject;
      bodyHtml = stored.bodyHtml || bodyHtml;
      source = 'stored';
    }
    // Draft content from the editor wins over stored/default, so the
    // preview always shows exactly what would be saved.
    if (dto.subject !== undefined || dto.bodyHtml !== undefined) {
      if (dto.subject !== undefined) subject = dto.subject;
      if (dto.bodyHtml !== undefined) bodyHtml = dto.bodyHtml;
      source = 'draft';
    }

    const vars = buildPreviewVars(definition, dto.vars);
    return {
      subject: renderEmailTemplate(subject, vars),
      bodyHtml: renderEmailTemplate(bodyHtml, vars),
      source,
      storedDisabled: !!stored && !stored.isActive,
    };
  }
}
