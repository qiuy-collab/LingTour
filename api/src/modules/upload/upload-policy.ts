import { extname } from 'path';

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
] as const;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);

type UploadCandidate = Pick<Express.Multer.File, 'mimetype' | 'originalname'>;

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
