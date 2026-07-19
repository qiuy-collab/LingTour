import { resolveMediaGallery, resolvePrimaryMedia } from './media';

describe('mixed media compatibility', () => {
  it('keeps an authored video as the primary asset', () => {
    const video = {
      type: 'video' as const,
      url: '/uploads/routes/arrival.mp4',
      poster: '/uploads/routes/arrival.webp',
    };

    expect(resolvePrimaryMedia(video, '/legacy.jpg')).toEqual(video);
  });

  it('falls back to a legacy primary image', () => {
    expect(resolvePrimaryMedia(null, '/legacy.jpg')).toEqual({
      type: 'image',
      url: '/legacy.jpg',
    });
  });

  it('falls back to the legacy gallery only when mixed media is empty', () => {
    expect(resolveMediaGallery([], ['/one.jpg', '/two.jpg'])).toEqual([
      { type: 'image', url: '/one.jpg' },
      { type: 'image', url: '/two.jpg' },
    ]);

    expect(
      resolveMediaGallery(
        [{ type: 'video', url: '/clip.webm', poster: '/poster.jpg' }],
        ['/legacy.jpg'],
      ),
    ).toEqual([{ type: 'video', url: '/clip.webm', poster: '/poster.jpg' }]);
  });
});
