import { join, resolve, sep } from 'path';
import {
  buildStoredUploadPath,
  normalizeUploadOriginalName,
  resolveStoredRelativePath,
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

describe('stored path resolution', () => {
  const uploadRoot = resolve(sep, 'app', 'uploads');

  it('derives the module-relative path when the file really is in a module directory', () => {
    expect(
      resolveStoredRelativePath(uploadRoot, join(uploadRoot, 'cities', 'a.jpg')),
    ).toBe('cities/a.jpg');
  });

  it('keeps a root-level upload at the root instead of claiming a module directory', () => {
    // A `file`-first multipart request leaves the parsed body without `module`
    // while the caller still asked for one, so multer writes to the root.
    // Registering the module-derived path would point at a file that is not
    // there; the real location must win.
    expect(
      resolveStoredRelativePath(uploadRoot, join(uploadRoot, 'a.jpg')),
    ).toBe('a.jpg');
  });

  it('rejects locations that are missing, outside the root, or nested too deeply', () => {
    expect(resolveStoredRelativePath(uploadRoot, undefined)).toBeNull();
    expect(resolveStoredRelativePath(uploadRoot, '')).toBeNull();
    expect(
      resolveStoredRelativePath(uploadRoot, join(uploadRoot, '..', 'secret.jpg')),
    ).toBeNull();
    expect(
      resolveStoredRelativePath(uploadRoot, join(uploadRoot, 'a', 'b', 'c.jpg')),
    ).toBeNull();
  });
});
