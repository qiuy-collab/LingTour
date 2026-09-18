import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailSmtpSettings } from './entities/email-smtp-settings.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailAdminService } from './email-admin.service';
import { MailerService } from './mailer.service';

describe('EmailAdminService', () => {
  let service: EmailAdminService;

  let smtpRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let templateRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mailer: {
    resolveSmtpConfig: jest.Mock;
    verifyConnection: jest.Mock;
    sendTestEmail: jest.Mock;
  };

  beforeEach(async () => {
    smtpRepo = {
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    };
    templateRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    };
    mailer = {
      resolveSmtpConfig: jest.fn(),
      verifyConnection: jest.fn(),
      sendTestEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAdminService,
        {
          provide: getRepositoryToken(EmailSmtpSettings),
          useValue: smtpRepo,
        },
        { provide: getRepositoryToken(EmailTemplate), useValue: templateRepo },
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();
    service = module.get<EmailAdminService>(EmailAdminService);
  });

  describe('getSmtpView', () => {
    it('returns an honest blank form when nothing is configured', async () => {
      mailer.resolveSmtpConfig.mockResolvedValue(null);
      smtpRepo.findOne.mockResolvedValue(null);

      const view = await service.getSmtpView();
      expect(view).toEqual(
        expect.objectContaining({
          host: '',
          port: 587,
          hasPassword: false,
          passwordSource: 'none',
        }),
      );
      // Never leak a password through the masked view.
      expect(JSON.stringify(view)).not.toContain('password=');
      expect(view).not.toHaveProperty('password');
    });

    it('returns effective values with the password masked to a boolean', async () => {
      mailer.resolveSmtpConfig.mockResolvedValue({
        host: 'smtp.example.com',
        port: 587,
        username: 'user@example.com',
        password: 'secret',
        fromEmail: 'no-reply@culvoy.com',
        fromName: 'Culvoy',
        useTls: true,
        source: 'database',
      });
      smtpRepo.findOne.mockResolvedValue({ password: 'secret' });

      const view = await service.getSmtpView();
      expect(view).toEqual(
        expect.objectContaining({
          host: 'smtp.example.com',
          hasPassword: true,
          passwordSource: 'database',
        }),
      );
      expect(view).not.toHaveProperty('password');
    });
  });

  describe('saveSmtpSettings', () => {
    it('keeps the stored password when the form field is empty', async () => {
      const existing = {
        scope: 'default',
        host: 'old.smtp.example.com',
        port: 587,
        username: 'old@example.com',
        password: 'stored-secret',
        fromEmail: null,
        fromName: null,
        useTls: true,
      };
      smtpRepo.findOne.mockResolvedValue(existing);
      mailer.resolveSmtpConfig.mockResolvedValue({
        host: 'new.smtp.example.com',
        port: 587,
        username: 'old@example.com',
        password: 'stored-secret',
        fromEmail: '',
        fromName: '',
        useTls: true,
        source: 'database',
      });

      await service.saveSmtpSettings({
        host: 'new.smtp.example.com',
        username: 'old@example.com',
        port: 587,
        password: '',
      });

      expect(smtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'new.smtp.example.com',
          password: 'stored-secret',
        }),
      );
    });

    it('overwrites the password only with a non-empty value', async () => {
      const existing = {
        scope: 'default',
        password: 'stored-secret',
      };
      smtpRepo.findOne.mockResolvedValue(existing);
      mailer.resolveSmtpConfig.mockResolvedValue({
        host: 'h',
        port: 587,
        username: 'u',
        password: 'new-secret',
        fromEmail: '',
        fromName: '',
        useTls: true,
        source: 'database',
      });

      await service.saveSmtpSettings({ password: 'new-secret' });
      expect(smtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'new-secret' }),
      );
    });
  });

  describe('templates', () => {
    it('rejects unknown event keys', async () => {
      await expect(
        service.saveTemplate('not_an_event', {
          locale: 'en',
          subject: 's',
          bodyHtml: '<p>b</p>',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects non-English locales', async () => {
      await expect(
        service.saveTemplate('signup_verification', {
          locale: 'zh',
          subject: 's',
          bodyHtml: '<p>b</p>',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('saves a template and returns the refreshed event view', async () => {
      templateRepo.findOne.mockResolvedValue(null);
      const saved = { eventKey: 'signup_verification', locale: 'en' };
      templateRepo.create.mockReturnValue(saved);
      templateRepo.save.mockResolvedValue(saved);

      const result = await service.saveTemplate('signup_verification', {
        locale: 'en',
        subject: 'Welcome',
        bodyHtml: '<p>Welcome {{code}}</p>',
      });
      expect(templateRepo.save).toHaveBeenCalled();
      expect(result.key).toBe('signup_verification');
    });

    it('previews draft content over stored content over defaults', async () => {
      templateRepo.findOne.mockResolvedValue({
        eventKey: 'signup_verification',
        locale: 'en',
        subject: 'Stored subject {{code}}',
        bodyHtml: '<p>stored {{code}}</p>',
        isActive: true,
      });

      const draft = await service.previewTemplate('signup_verification', {
        locale: 'en',
        subject: 'Draft {{code}}',
        bodyHtml: '<p>draft {{code}}</p>',
      });
      expect(draft.subject).toBe('Draft 482913');
      expect(draft.bodyHtml).toBe('<p>draft 482913</p>');

      const stored = await service.previewTemplate('signup_verification', {});
      expect(stored.subject).toBe('Stored subject 482913');
    });

    it('marks planned events honestly in the event list', async () => {
      const { events } = await service.listTemplateEvents();
      const active = events.filter((e) => e.status === 'active');
      const planned = events.filter((e) => e.status === 'planned');
      expect(active.map((e) => e.key)).toEqual([
        'signup_verification',
        'login_verification',
        'email_change_verification',
      ]);
      expect(planned.length).toBeGreaterThan(0);
    });
  });
});
