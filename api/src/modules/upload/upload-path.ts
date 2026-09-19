import { BadRequestException } from '@nestjs/common';
import { basename, isAbsolute, posix, relative, resolve } from 'path';

const ALLOWED_MODULES = new Set([
  'avatars',
  'cities',
  'community',
  'events',
  'home',
  'interpreting',
  'routes',
  'shop',
  'seed',
]);

export function normalizeUploadOriginalName(value?: string): string {
  if (!value) {
    return '';
  }

  const decoded = Buffer.from(value, 'latin1').toString('utf8');
  if (decoded === value || decoded.includes('\uFFFD')) {
    return value;
  }

  const roundTrip = Buffer.from(decoded, 'utf8').toString('latin1');
  return roundTrip === value ? decoded : value;
}

export function sanitizeUploadModule(module?: string): string | undefined {
  if (!module) {
    return undefined;
  }

  const normalized = module.trim();
  if (!normalized) {
    return undefined;
  }

  if (
    normalized.includes('/') ||
    normalized.includes('\\') ||
    normalized.includes('..')
  ) {
    throw new BadRequestException('Invalid upload module');
  }

  if (!ALLOWED_MODULES.has(normalized)) {
    throw new BadRequestException(`Unsupported upload module: ${normalized}`);
  }

  return normalized;
}

/**
 * Validate the module segment of an ALREADY-STORED path.
 *
 * Deliberately does NOT consult ALLOWED_MODULES. That set gates what NEW
 * uploads may write; stored paths are historical data, so a file under
 * `entry/`, `preview/` or `interpreters/` is legitimate even though those
 * names are no longer upload targets. Routing them through the upload
 * whitelist made every such file impossible to list, serve or delete.
 * Path safety is enforced independently: `resolveStoredUploadPath` re-checks
 * that the resolved path stays inside the upload root.
 */
export function sanitizeStoredModule(module?: string): string | undefined {
  if (!module) {
    return undefined;
  }

  const normalized = module.trim();
  if (!normalized) {
    return undefined;
  }

  if (
    normalized.includes('/') ||
    normalized.includes('\\') ||
    normalized.includes('..')
  ) {
    throw new BadRequestException('Invalid upload module');
  }

  return normalized;
}

export function buildStoredUploadPath(
  filename: string,
  module?: string,
): string {
  const safeFilename = basename(filename).trim();
  if (!safeFilename) {
    throw new BadRequestException('Invalid upload filename');
  }

  const safeModule = sanitizeUploadModule(module);
  return safeModule ? posix.join(safeModule, safeFilename) : safeFilename;
}

export function normalizeStoredRelativePath(
  filename: string,
  module?: string,
): string {
  const normalizedInput = filename.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalizedInput.split('/').filter(Boolean);

  if (segments.length === 0 || segments.length > 2) {
    throw new BadRequestException('Invalid upload filename');
  }

  if (!module && segments.length >= 2) {
    const safeModule = sanitizeStoredModule(segments[0]);
    if (safeModule) {
      return posix.join(safeModule, basename(segments[segments.length - 1]));
    }
  }

  return buildStoredUploadPath(filename, module);
}

export function buildPublicUploadUrl(
  filename: string,
  module?: string,
): string {
  const storedPath = normalizeStoredRelativePath(filename, module);
  const encodedPath = storedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/uploads/${encodedPath}`;
}

/**
 * Derive the stored relative path ("cities/<uuid>.jpg") from the absolute
 * location a file was actually written to.
 *
 * Deriving it from the requested module is only correct when multipart parsing
 * has already populated the body, which depends on the `module` part arriving
 * before the `file` part. When it does not, the bytes land in the uploads root
 * while the derived path still claims a module directory, so the stored file,
 * its media_files row and its public URL disagree. Reading the real location
 * keeps all three in agreement whatever the field order is.
 *
 * Returns null when the location is missing, outside the upload root, or
 * deeper than the single module level the upload layout allows.
 */
export function resolveStoredRelativePath(
  uploadRoot: string,
  storedPath?: string,
): string | null {
  if (typeof storedPath !== 'string' || !storedPath) {
    return null;
  }

  const normalizedRoot = resolve(uploadRoot);
  const absolutePath = resolve(storedPath);
  const relativePath = relative(normalizedRoot, absolutePath);

  if (
    !relativePath ||
    isAbsolute(relativePath) ||
    relativePath.startsWith('..')
  ) {
    return null;
  }

  const segments = relativePath
    .split(/[\\/]/)
    .filter((segment) => segment && segment !== '.');

  if (segments.length === 0 || segments.length > 2) {
    return null;
  }

  return segments.join('/');
}

export function resolveStoredUploadPath(
  uploadRoot: string,
  filename: string,
): string {
  const storedPath = normalizeStoredRelativePath(filename);
  const absolutePath = resolve(uploadRoot, storedPath);
  const normalizedRoot = resolve(uploadRoot);
  const resolvedRelative = relative(normalizedRoot, absolutePath);

  if (
    !resolvedRelative ||
    resolvedRelative.startsWith('..') ||
    resolve(normalizedRoot, resolvedRelative) !== absolutePath
  ) {
    throw new BadRequestException('Invalid upload filename');
  }

  return absolutePath;
}
