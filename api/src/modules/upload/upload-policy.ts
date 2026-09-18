import { open, unlink } from 'fs/promises';
import { extname } from 'path';

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
/**
 * A live photo (实况图) carries a short motion clip, so it needs the larger
 * ceiling that video uses even though it is uploaded as an image.
 */
export const MAX_LIVE_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * A live photo (实况图) is a media *image* variant: the traveller posts a still
 * that carries a short motion clip, uploaded through the very same endpoint as
 * a photo. Browsers type the file as `video/*`, so live photos and real video
 * share one container list — what differs is the pipeline that consumes them.
 * Community post media is only ever `image` or `live`; real video belongs to
 * the admin media library.
 */
export const LIVE_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
] as const;

export const VIDEO_MIME_TYPES = LIVE_MIME_TYPES;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const LIVE_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const VIDEO_EXTENSIONS = LIVE_EXTENSIONS;

type UploadCandidate = Pick<Express.Multer.File, 'mimetype' | 'originalname'>;

function startsWithBytes(buffer: Buffer, bytes: number[]): boolean {
  return bytes.every((byte, index) => buffer[index] === byte);
}

/**
 * 取用于签名校验的文件头字节。
 *
 * multer 配置为 diskStorage，上传时文件先落盘、不提供 buffer，
 * 因此需要从磁盘读取文件头；memoryStorage 下直接复用内存内容。
 */
export async function readUploadHead(
  file: { buffer?: Buffer; path?: string },
  size = 16,
): Promise<Buffer | null> {
  if (Buffer.isBuffer(file?.buffer)) return file.buffer;
  if (typeof file?.path !== 'string' || !file.path) return null;

  try {
    const handle = await open(file.path, 'r');
    try {
      const head = Buffer.alloc(size);
      const { bytesRead } = await handle.read(head, 0, size, 0);
      return head.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }
  } catch {
    return null;
  }
}

/** 校验失败时清理 diskStorage 已经落盘的文件，避免在 uploads 目录留下孤儿文件。 */
export async function discardUploadedFile(file: {
  path?: string;
}): Promise<void> {
  if (typeof file?.path !== 'string' || !file.path) return;

  try {
    await unlink(file.path);
  } catch {
    // 清理是尽力而为，不能覆盖调用方原本要抛出的错误。
  }
}

export function hasValidUploadSignature(
  file: Pick<Express.Multer.File, 'mimetype' | 'buffer'>,
): boolean {
  const buffer = file.buffer;
  if (!Buffer.isBuffer(buffer)) return false;

  if (file.mimetype === 'image/jpeg') {
    return startsWithBytes(buffer, [0xff, 0xd8, 0xff]);
  }
  if (file.mimetype === 'image/png') {
    return startsWithBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (file.mimetype === 'image/gif') {
    return startsWithBytes(buffer, [0x47, 0x49, 0x46, 0x38]) &&
      (buffer.subarray(4, 6).toString('ascii') === '7a' ||
        buffer.subarray(4, 6).toString('ascii') === '9a');
  }
  if (file.mimetype === 'image/webp') {
    return startsWithBytes(buffer, [0x52, 0x49, 0x46, 0x46]) &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  if (file.mimetype === 'video/webm') {
    return startsWithBytes(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
  }
  if (file.mimetype === 'video/mp4' ||
      file.mimetype === 'video/quicktime' ||
      file.mimetype === 'video/x-m4v') {
    return buffer.subarray(4, 8).toString('ascii') === 'ftyp';
  }
  return false;
}

export function isAllowedImageUpload(file: UploadCandidate): boolean {
  return (
    IMAGE_MIME_TYPES.includes(
      file.mimetype as (typeof IMAGE_MIME_TYPES)[number],
    ) && IMAGE_EXTENSIONS.has(extname(file.originalname).toLowerCase())
  );
}

export function isAllowedVideoUpload(file: UploadCandidate): boolean {
  return (
    VIDEO_MIME_TYPES.includes(
      file.mimetype as (typeof VIDEO_MIME_TYPES)[number],
    ) && VIDEO_EXTENSIONS.has(extname(file.originalname).toLowerCase())
  );
}

/**
 * Live photos (实况图) are accepted by the community image endpoint, so this is
 * the image-side counterpart of `isAllowedVideoUpload`. It currently accepts
 * the same containers, and exists as a separate predicate so the two media
 * semantics stay independently evolvable.
 */
export function isAllowedLiveUpload(file: UploadCandidate): boolean {
  return (
    LIVE_MIME_TYPES.includes(
      file.mimetype as (typeof LIVE_MIME_TYPES)[number],
    ) && LIVE_EXTENSIONS.has(extname(file.originalname).toLowerCase())
  );
}
