import { isAllowedImageUpload, isAllowedVideoUpload } from './upload-policy';

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
});
