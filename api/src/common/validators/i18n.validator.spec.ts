import {
  IsI18nObjectConstraint,
  IsI18nArrayConstraint,
  IsI18nArray,
  IsI18nObject,
} from './i18n.validator';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { IsOptional } from 'class-validator';
import { UpdateRouteDto } from '../../modules/routes/dto/update-route.dto';

describe('IsI18nObjectConstraint', () => {
  const validator = new IsI18nObjectConstraint();

  it('should accept valid { en, zh } object', () => {
    expect(validator.validate({ en: 'Hello', zh: '你好' })).toBe(true);
  });

  it('should accept MD content in values', () => {
    expect(
      validator.validate({
        en: '## Title\n\nParagraph text...',
        zh: '## 标题\n\n段落文字...',
      }),
    ).toBe(true);
  });

  it('should reject null', () => {
    expect(validator.validate(null)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validator.validate(undefined)).toBe(false);
  });

  it('should reject non-object (string)', () => {
    expect(validator.validate('plain string')).toBe(false);
  });

  it('should reject non-object (number)', () => {
    expect(validator.validate(42)).toBe(false);
  });

  it('should reject object missing "en"', () => {
    expect(validator.validate({ zh: '中文' })).toBe(false);
  });

  it('should reject object missing "zh"', () => {
    expect(validator.validate({ en: 'English' })).toBe(false);
  });

  it('should reject object with non-string en', () => {
    expect(validator.validate({ en: 123, zh: '中文' })).toBe(false);
  });

  it('should generate a useful error message', () => {
    const msg = validator.defaultMessage({ property: 'title' } as any);
    expect(msg).toContain('title');
    expect(msg).toContain('{ en: string, zh: string }');
  });
});

describe('IsI18nArrayConstraint', () => {
  const validator = new IsI18nArrayConstraint();

  it('should accept array of valid i18n objects', () => {
    expect(
      validator.validate([
        { en: 'Coast', zh: '滨海' },
        { en: 'Seafood', zh: '海鲜' },
      ]),
    ).toBe(true);
  });

  it('should accept empty array', () => {
    expect(validator.validate([])).toBe(true);
  });

  it('should reject non-array', () => {
    expect(validator.validate({ en: 'test', zh: '测试' })).toBe(false);
  });

  it('should reject array with invalid item', () => {
    expect(
      validator.validate([
        { en: 'Valid', zh: '有效' },
        { en: 'Invalid' }, // missing zh
      ]),
    ).toBe(false);
  });

  it('should generate a useful error message', () => {
    const msg = validator.defaultMessage({ property: 'tags' } as any);
    expect(msg).toContain('tags');
    expect(msg).toContain('array');
  });
});

/**
 * The constraint tests above pass a value straight to the validator, so they
 * never saw the transform step. The global pipe runs with
 * enableImplicitConversion, which coerced the members of an array with no
 * declared element type into [] — saving an unedited admin form blanked every
 * @IsI18nArray field and still answered 200. IsI18nArray now applies
 * Type(() => Object) itself; these tests fail if that is removed.
 */
describe('IsI18nArray under the global ValidationPipe', () => {
  class ProbeDto {
    @IsOptional()
    @IsI18nArray()
    details?: { en: string; zh: string }[];

    @IsOptional()
    @IsI18nObject()
    title?: { en: string; zh: string };
  }

  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });

  it('keeps { en, zh } members instead of emptying them', async () => {
    const details = [
      { en: 'Maar lake field landscape', zh: '玛珥湖地貌现场' },
      { en: 'Peninsula geology', zh: '半岛地质' },
    ];

    const result = (await pipe.transform(
      { details },
      { type: 'body', metatype: ProbeDto, data: '' },
    )) as ProbeDto;

    expect(result.details).toEqual(details);
  });

  it('still rejects members that are not i18n objects', async () => {
    await expect(
      pipe.transform(
        { details: [{ en: 'only english' }] },
        { type: 'body', metatype: ProbeDto, data: '' },
      ),
    ).rejects.toThrow();
  });

  it('preserves route stop details through a nested update payload', async () => {
    const stop = {
      sortOrder: 0,
      time: '08:00',
      stopName: { en: 'Huguangyan Maar Lake', zh: '湖光岩玛珥湖' },
      culturalStory: { en: 'A crater lake', zh: '火山口湖' },
      story: { en: 'Morning start', zh: '清晨出发' },
      image: '/uploads/routes/huguangyan.jpg',
      details: [{ en: 'Maar lake field landscape', zh: '玛珥湖地貌现场' }],
    };

    const result = (await pipe.transform(
      { stops: [stop] },
      { type: 'body', metatype: UpdateRouteDto, data: '' },
    )) as { stops: Array<{ details: unknown }> };

    expect(result.stops[0].details).toEqual(stop.details);
  });
});
