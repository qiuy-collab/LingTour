import {
  hasValidUploadSignature,
  isAllowedImageUpload,
  isAllowedVideoUpload,
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
