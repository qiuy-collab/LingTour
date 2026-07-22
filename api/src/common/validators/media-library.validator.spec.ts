import { validate } from 'class-validator';
import {
  ContainsOnlyMediaLibraryPaths,
  IsMediaLibraryPath,
  containsOnlyMediaLibraryPaths,
  isMediaLibraryPath,
} from './media-library.validator';

class MediaPathFixture {
  @IsMediaLibraryPath()
  path = '';
}

class MediaConfigFixture {
  @ContainsOnlyMediaLibraryPaths()
  config: Record<string, unknown> = {};
}

describe('media library validators', () => {
  it('accepts uploaded media paths and rejects external URLs', () => {
    expect(isMediaLibraryPath('/uploads/home/hero-film.mp4')).toBe(true);
    expect(isMediaLibraryPath('https://cdn.example.com/hero.mp4')).toBe(false);
    expect(isMediaLibraryPath('/editorial/hero.jpg')).toBe(false);
  });

  it('validates a direct DTO media field', async () => {
    const fixture = new MediaPathFixture();
    fixture.path = 'https://example.com/image.jpg';
    expect(await validate(fixture)).toHaveLength(1);

    fixture.path = '/uploads/cities/guangzhou.jpg';
    expect(await validate(fixture)).toHaveLength(0);
  });

  it('finds external media in nested home configuration', async () => {
    expect(
      containsOnlyMediaLibraryPaths({
        video: {
          url: '/uploads/home/guangdong.mp4',
          poster: '/uploads/home/poster.webp',
        },
      }),
    ).toBe(true);

    const fixture = new MediaConfigFixture();
    fixture.config = {
      video: { url: 'https://video.example.com/guangdong.mp4' },
    };
    expect(await validate(fixture)).toHaveLength(1);
  });
});
