import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailSmtpSettings } from './entities/email-smtp-settings.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { MailerService } from './mailer.service';

jest.mock('nodemailer', () => {
  const sendMail = jest.fn().mockResolvedValue({});
  const verify = jest.fn().mockResolvedValue(true);
  const createTransport = jest.fn(() => ({ sendMail, verify }));
  return { __esModule: true, default: { createTransport }, createTransport };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailerMock = jest.requireMock('nodemailer') as {
  default: { createTransport: jest.Mock };
};

describe('MailerService SMTP resolution', () => {
  let service: MailerService;

  let smtpRepo: { findOne: jest.Mock };
  let templateRepo: { findOne: jest.Mock };
  let configGet: jest.Mock;

  const envConfig: Record<string, string> = {
    SMTP_HOST: 'env.smtp.example.com',
    SMTP_PORT: '2525',
    SMTP_USER: 'env-user@example.com',
    SMTP_PASS: 'env-pass',
    SMTP_FROM: 'Culvoy <no-reply@culvoy.com>',
  };

  beforeEach(async () => {
    smtpRepo = { findOne: jest.fn() };
    templateRepo = { findOne: jest.fn() };
    configGet = jest.fn((key: string) => envConfig[key]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: getRepositoryToken(EmailSmtpSettings), useValue: smtpRepo },
        { provide: getRepositoryToken(EmailTemplate), useValue: templateRepo },
      ],
    }).compile();
    service = module.get<MailerService>(MailerService);
  });

  it('falls back to the environment when no database row exists', async () => {
    smtpRepo.findOne!.mockResolvedValue(null);

    const config = await service.resolveSmtpConfig();
    expect(config).not.toBeNull();
    expect(config!.host).toBe('env.smtp.example.com');
    expect(config!.port).toBe(2525);
    expect(config!.username).toBe('env-user@example.com');
    expect(config!.password).toBe('env-pass');
    expect(config!.source).toBe('environment');
  });

  it('prefers database values over the environment', async () => {
    smtpRepo.findOne!.mockResolvedValue({
      host: 'db.smtp.example.com',
      port: 465,
      username: 'db-user@example.com',
      password: 'db-pass',
      fromEmail: 'db-from@culvoy.com',
      fromName: 'Culvoy Mailer',
      useTls: true,
    } as EmailSmtpSettings);

    const config = await service.resolveSmtpConfig();
    expect(config!.host).toBe('db.smtp.example.com');
    expect(config!.port).toBe(465);
    expect(config!.password).toBe('db-pass');
    expect(config!.source).toBe('database');
  });

  it('falls back field-by-field when database columns are empty', async () => {
    smtpRepo.findOne!.mockResolvedValue({
      host: 'db.smtp.example.com',
      port: 587,
      username: null,
      password: null,
      fromEmail: null,
      fromName: null,
      useTls: true,
    } as EmailSmtpSettings);

    const config = await service.resolveSmtpConfig();
    expect(config!.host).toBe('db.smtp.example.com');
    expect(config!.username).toBe('env-user@example.com');
    expect(config!.password).toBe('env-pass');
    expect(config!.fromEmail).toBe('Culvoy <no-reply@culvoy.com>');
  });

  it('returns null when neither source provides a usable config', async () => {
    smtpRepo.findOne!.mockResolvedValue(null);
    configGet.mockReturnValue(undefined);

    expect(await service.resolveSmtpConfig()).toBeNull();
  });

  it('lets explicit overrides win and keeps an empty password override from wiping the stored one', async () => {
    smtpRepo.findOne!.mockResolvedValue({
      host: 'db.smtp.example.com',
      port: 587,
      username: 'db-user@example.com',
      password: 'db-pass',
      fromEmail: null,
      fromName: null,
      useTls: true,
    } as EmailSmtpSettings);

    const override = await service.resolveSmtpConfig({
      host: 'draft.smtp.example.com',
      password: '',
    });
    expect(override!.host).toBe('draft.smtp.example.com');
    // Empty override = "keep what is stored" (db first, env fallback).
    expect(override!.password).toBe('db-pass');

    const replaced = await service.resolveSmtpConfig({ password: 'new-pass' });
    expect(replaced!.password).toBe('new-pass');
  });

  it('renders a stored template and sends through the resolved transport', async () => {
    smtpRepo.findOne!.mockResolvedValue({
      host: 'db.smtp.example.com',
      port: 587,
      username: 'u',
      password: 'p',
      fromEmail: 'from@culvoy.com',
      fromName: '',
      useTls: true,
    } as EmailSmtpSettings);
    templateRepo.findOne!.mockResolvedValue({
      eventKey: 'signup_verification',
      locale: 'en',
      subject: 'Custom {{code}}',
      bodyHtml: '<p>Code: {{code}}</p>',
      isActive: true,
    } as EmailTemplate);

    const delivered = await service.sendTemplated(
      'signup_verification',
      'to@example.com',
      { code: '123456', minutes: 10 },
    );
    expect(delivered).toBe(true);
    expect(nodemailerMock.default.createTransport).toHaveBeenCalled();
    const transport = nodemailerMock.default.createTransport.mock.results[0].value;
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'to@example.com',
        subject: 'Custom 123456',
        html: '<p>Code: 123456</p>',
      }),
    );
  });

  it('reports failure instead of throwing when the transport rejects', async () => {
    smtpRepo.findOne!.mockResolvedValue({
      host: 'db.smtp.example.com',
      port: 587,
      username: 'u',
      password: 'p',
      fromEmail: null,
      fromName: null,
      useTls: true,
    } as EmailSmtpSettings);
    templateRepo.findOne!.mockResolvedValue(null);
    const transport = nodemailerMock.default.createTransport.mock.results[0].value;
    transport.sendMail.mockRejectedValueOnce(new Error('connection refused'));

    const delivered = await service.sendTemplated(
      'login_verification',
      'to@example.com',
      { code: '654321', minutes: 10 },
    );
    expect(delivered).toBe(false);
  });
});
