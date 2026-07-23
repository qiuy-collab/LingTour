import {
  buildStoredUploadPath,
  normalizeUploadOriginalName,
  sanitizeUploadModule,
} from './upload-path';

describe('upload path helpers', () => {
  it('recovers UTF-8 Chinese filenames decoded as latin1 by multipart parsers', () => {
    expect(
      normalizeUploadOriginalName(
        'å±å¹æªå¾ 2026-03-27 140716.png',
      ),
    ).toBe('屏幕截图 2026-03-27 140716.png');
  });

  it('keeps valid unicode and ascii filenames unchanged', () => {
    expect(normalizeUploadOriginalName('屏幕截图.png')).toBe('屏幕截图.png');
    expect(normalizeUploadOriginalName('route-cover.jpg')).toBe(
      'route-cover.jpg',
    );
    expect(normalizeUploadOriginalName('café.jpg')).toBe('café.jpg');
  });

  it('keeps module paths constrained to supported categories', () => {
    expect(sanitizeUploadModule('cities')).toBe('cities');
    expect(buildStoredUploadPath('cover.jpg', 'cities')).toBe(
      'cities/cover.jpg',
    );
    expect(() => sanitizeUploadModule('../cities')).toThrow();
  });
});
