import {
  IsI18nObjectConstraint,
  IsI18nArrayConstraint,
} from './i18n.validator';

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
