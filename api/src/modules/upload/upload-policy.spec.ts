import { access, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  discardUploadedFile,
  hasValidUploadSignature,
  isAllowedImageUpload,
  isAllowedVideoUpload,
  readUploadHead,
} from './upload-policy';

describe('upload policy', () => {
  it('accepts supported image MIME and extension pairs', () => {
    expect(
      isAllowedImageUpload({
        mimetype: 'image/webp',
        originalname: 'city-cover.WEBP',
      }),
    ).toBe(true);
  });

  it('accepts supported video MIME and extension pairs', () => {
    expect(
      isAllowedVideoUpload({
        mimetype: 'video/mp4',
        originalname: 'route-intro.mp4',
      }),
    ).toBe(true);
    expect(
      isAllowedVideoUpload({
        mimetype: 'video/quicktime',
        originalname: 'route-intro.mov',
      }),
    ).toBe(true);
  });

  it('rejects spoofed or unsupported file pairs', () => {
    expect(
      isAllowedVideoUpload({
        mimetype: 'video/mp4',
        originalname: 'route-intro.exe',
      }),
    ).toBe(false);
    expect(
      isAllowedImageUpload({
        mimetype: 'image/svg+xml',
        originalname: 'unsafe.svg',
      }),
    ).toBe(false);
  });

  it('rejects content that only spoofs an allowed MIME type', () => {
    expect(
      hasValidUploadSignature({
        mimetype: 'image/png',
        buffer: Buffer.from('<script>alert(1)</script>'),
      } as Express.Multer.File),
    ).toBe(false);
  });

  it('accepts valid image and video signatures', () => {
    expect(
      hasValidUploadSignature({
        mimetype: 'image/png',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      } as Express.Multer.File),
    ).toBe(true);
    expect(
      hasValidUploadSignature({
        mimetype: 'video/mp4',
        buffer: Buffer.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70]),
      } as Express.Multer.File),
    ).toBe(true);
  });
});

describe('disk-stored uploads', () => {
  const imageBytes = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  ]);

  it('reads the head of a file multer already wrote to disk', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'upload-head-'));
    const filePath = join(directory, 'stored.jpg');

    try {
      await writeFile(filePath, imageBytes);
      const head = await readUploadHead({ path: filePath });

      expect(head).not.toBeNull();
      expect(
        hasValidUploadSignature({
          mimetype: 'image/jpeg',
          buffer: head as Buffer,
        }),
      ).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects disk content that contradicts the declared type', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'upload-head-'));
    const filePath = join(directory, 'spoofed.jpg');

    try {
      await writeFile(filePath, Buffer.from('<script>alert(1)</script>'));
      const head = await readUploadHead({ path: filePath });

      expect(
        hasValidUploadSignature({
          mimetype: 'image/jpeg',
          buffer: head as Buffer,
        }),
      ).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('reuses an in-memory buffer when multer keeps one', async () => {
    await expect(readUploadHead({ buffer: imageBytes })).resolves.toBe(
      imageBytes,
    );
  });

  it('reports no head when the upload exposes neither buffer nor path', async () => {
    await expect(readUploadHead({})).resolves.toBeNull();
  });

  it('removes a rejected upload so it cannot become an orphan file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'upload-head-'));
    const filePath = join(directory, 'rejected.jpg');
    await writeFile(filePath, imageBytes);

    await discardUploadedFile({ path: filePath });

    await expect(access(filePath)).rejects.toThrow();
    await rm(directory, { recursive: true, force: true });
  });

  it('ignores a discarded upload without a path', async () => {
    await expect(discardUploadedFile({})).resolves.toBeUndefined();
  });
});
