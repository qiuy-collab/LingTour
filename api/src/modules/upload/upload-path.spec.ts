import { join, resolve, sep } from 'path';
import {
  buildStoredUploadPath,
  normalizeStoredRelativePath,
  normalizeUploadOriginalName,
  resolveStoredRelativePath,
  resolveStoredUploadPath,
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

describe('stored module validation', () => {
  it('accepts stored module names that are no longer upload targets', () => {
    // `entry/`, `preview/` and `interpreters/` exist in the deployed uploads
    // tree but are absent from ALLOWED_MODULES. Resolution must not route them
    // through the upload whitelist, or those files can never be listed, served
    // or deleted — which is exactly the media-library delete failure (Q1).
    expect(normalizeStoredRelativePath('entry/a.jpg')).toBe('entry/a.jpg');
    expect(normalizeStoredRelativePath('preview/b.png')).toBe('preview/b.png');
    expect(normalizeStoredRelativePath('interpreters/c.webp')).toBe(
      'interpreters/c.webp',
    );
  });

  it('still rejects traversal and over-nested stored paths', () => {
    expect(() => normalizeStoredRelativePath('../secret.jpg')).toThrow();
    expect(() => normalizeStoredRelativePath('a/b/c.jpg')).toThrow();
  });

  it('keeps the whitelist in force for NEW uploads', () => {
    // The relaxation above is deliberately one-directional: writing a new file
    // into a retired module directory stays rejected.
    expect(() => sanitizeUploadModule('entry')).toThrow();
  });

  it('resolves a retired-module stored path for deletion (deleteFile entry)', () => {
    // `deleteFile` goes through resolveStoredUploadPath; before the fix this
    // threw for every `entry/…`, `preview/…` and `interpreters/…` file, and
    // the service swallowed it into a plain "false".
    const root = resolve(sep, 'app', 'uploads');
    expect(resolveStoredUploadPath(root, 'entry/a.jpg')).toBe(
      join(root, 'entry', 'a.jpg'),
    );
    expect(() => resolveStoredUploadPath(root, '../secret.jpg')).toThrow();
  });
});
