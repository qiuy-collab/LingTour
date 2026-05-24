import { BadRequestException } from '@nestjs/common';
import { basename, posix, resolve, relative } from 'path';

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

export function sanitizeUploadModule(module?: string): string | undefined {
  if (!module) {
    return undefined;
  }

  const normalized = module.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.includes('/') || normalized.includes('\\') || normalized.includes('..')) {
    throw new BadRequestException('Invalid upload module');
  }

  if (!ALLOWED_MODULES.has(normalized)) {
    throw new BadRequestException(`Unsupported upload module: ${normalized}`);
  }

  return normalized;
}

export function buildStoredUploadPath(filename: string, module?: string): string {
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
    const safeModule = sanitizeUploadModule(segments[0]);
    if (safeModule) {
      return posix.join(safeModule, basename(segments[segments.length - 1]));
    }
  }

  return buildStoredUploadPath(filename, module);
}

export function buildPublicUploadUrl(filename: string, module?: string): string {
  const storedPath = normalizeStoredRelativePath(filename, module);
  const encodedPath = storedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/uploads/${encodedPath}`;
}

export function resolveStoredUploadPath(uploadRoot: string, filename: string): string {
  const storedPath = normalizeStoredRelativePath(filename);
  const absolutePath = resolve(uploadRoot, storedPath);
  const normalizedRoot = resolve(uploadRoot);
  const resolvedRelative = relative(normalizedRoot, absolutePath);

  if (!resolvedRelative || resolvedRelative.startsWith('..') || resolve(normalizedRoot, resolvedRelative) !== absolutePath) {
    throw new BadRequestException('Invalid upload filename');
  }

  return absolutePath;
}
