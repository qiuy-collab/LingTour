import { QueryRunner } from 'typeorm';
import { legacyCityToMarkdown } from './city-markdown';
import { AddCityMarkdown1761800000000 } from './migrations/1761800000000-AddCityMarkdown';

const en = (value: string) => ({ en: value, zh: `中文 ${value}` });

describe('legacy city Markdown migration', () => {
  it('retains English text, ordered sections, statistics, quotations and every media field', () => {
    const city = {
      name: en('Harbour'),
      editor_intro: en('# Introduction\n\n**Rich** intro.'),
      hero_narrative: en('Hero narrative.'),
      hero_image: '/uploads/legacy-hero.jpg',
      hero_media: {
        type: 'video',
        url: '/uploads/hero.mp4',
        poster: '/uploads/hero-poster.jpg',
        alt: en('Hero film'),
      },
      gallery_images: ['/uploads/legacy-gallery.jpg'],
      gallery_media: [
        { type: 'image', url: '/uploads/gallery.jpg', alt: en('Gallery alt') },
      ],
      sections: [
        { title: en('Second'), body: en('Second body.'), sort_order: 2 },
        {
          title: en('First'),
          body: en('First body.\n\nA paragraph.'),
          sort_order: 1,
          stat_label: en('Coastline'),
          stat_value: en('1,243 km'),
          breath_quote: en('First quote line.\nSecond quote line.'),
          image: '/uploads/section.jpg',
          breath_image: '/uploads/breath.jpg',
          images: ['/uploads/section-gallery.jpg'],
          primary_media: {
            type: 'video',
            url: '/uploads/section.mp4',
            poster: '/uploads/section-poster.jpg',
            alt: en('Section film'),
          },
          media: [
            {
              type: 'image',
              url: '/uploads/section-media.jpg',
              alt: en('Section image'),
            },
          ],
        },
      ],
      food_title: en('Local food'),
      food_description: en('Food description.'),
      food_images: ['/uploads/food.jpg'],
    };
    const before = structuredClone(city);
    const markdown = legacyCityToMarkdown(city);
    expect(city).toEqual(before);
    expect(markdown).toContain(
      '# Introduction\n\n**Rich** intro.\n\nHero narrative.',
    );
    expect(markdown.indexOf('## First')).toBeLessThan(
      markdown.indexOf('## Second'),
    );
    expect(markdown.indexOf('## Second')).toBeLessThan(
      markdown.indexOf('## Local food'),
    );
    expect(markdown).toContain('**Coastline**: 1,243 km');
    expect(markdown).toContain('> First quote line.\n> Second quote line.');
    expect(markdown).toContain('First body.\n\nA paragraph.');
    expect(markdown).toContain('[Hero film](</uploads/hero.mp4>)');
    expect(markdown).not.toContain('![Hero film](</uploads/hero.mp4>)');
    for (const file of [
      'legacy-hero.jpg',
      'hero.mp4',
      'hero-poster.jpg',
      'legacy-gallery.jpg',
      'gallery.jpg',
      'section.jpg',
      'breath.jpg',
      'section-gallery.jpg',
      'section.mp4',
      'section-poster.jpg',
      'section-media.jpg',
      'food.jpg',
    ])
      expect(markdown).toContain(`/uploads/${file}`);
    expect(markdown).toContain('![Gallery alt](</uploads/gallery.jpg>)');
    expect(markdown).not.toContain('中文');
  });

  it('escapes captions and URL delimiters instead of creating HTML or injected links', () => {
    const markdown = legacyCityToMarkdown({
      hero_media: {
        type: 'image',
        url: 'https://example.com/photo (1).jpg?q=<script>',
        alt: en('Picture ](javascript:alert(1)) <img onerror=bad>'),
      },
      gallery_images: [
        'javascript:alert(1)',
        'data:image/svg+xml,<svg>',
        '//evil.test/image.jpg',
        '/\\evil.test/image.jpg',
      ],
    });
    expect(markdown).toContain('photo%20%281%29.jpg?q=%3Cscript%3E');
    expect(markdown).toContain('\\]\\(javascript:alert\\(1\\)\\)');
    expect(markdown).toContain('&lt;img onerror=bad&gt;');
    expect(markdown).not.toContain('<img');
    expect(markdown).not.toMatch(/\]\(<(?:javascript:|data:|\/\/|\/\\)/);
    expect(markdown).toContain('javascript:alert\\(1\\)');
    expect(markdown).toContain('data:image/svg+xml,&lt;svg&gt;');
  });

  it('deduplicates repeated image URLs while keeping distinct caption metadata and link types', () => {
    const markdown = legacyCityToMarkdown({
      hero_image: '/uploads/shared.jpg',
      hero_media: {
        type: 'image',
        url: '/uploads/shared.jpg',
        alt: en('Distinct alt'),
      },
      gallery_images: ['/uploads/shared.jpg', '/uploads/unique.jpg'],
      gallery_media: [{ type: 'video', url: '/uploads/shared.jpg' }],
      sections: [
        { image: '/uploads/shared.jpg', breath_image: '/uploads/shared.jpg' },
      ],
    });
    expect(
      markdown.match(/!\[[^\n]*\]\(<\/uploads\/shared.jpg>\)/g),
    ).toHaveLength(1);
    expect(markdown).toContain('Distinct alt');
    expect(markdown).toContain('[City gallery](</uploads/shared.jpg>)');
    expect(markdown).toContain('![City gallery](</uploads/unique.jpg>)');
  });

  it('handles empty and malformed legacy JSON without inventing content', () => {
    expect(legacyCityToMarkdown({})).toBe('');
    expect(
      legacyCityToMarkdown({
        editor_intro: null,
        hero_narrative: [],
        gallery_images: {},
        sections: [null],
      }),
    ).toBe('');
  });

  it('adds the columns and only writes parameterized Markdown for blank records', async () => {
    const city = {
      id: 'legacy-id',
      editor_intro: en("A writer's story"),
      sections: [],
    };
    const query = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([city])
      .mockResolvedValueOnce(undefined);
    await new AddCityMarkdown1761800000000().up({
      query,
    } as unknown as QueryRunner);
    expect(query.mock.calls[0][0]).toContain(
      "content_markdown TEXT NOT NULL DEFAULT ''",
    );
    expect(query.mock.calls[0][0]).toContain('published_at TIMESTAMPTZ');
    expect(query.mock.calls[1][0]).toContain("WHERE c.content_markdown = ''");
    expect(query.mock.calls[1][0]).toContain(
      'ORDER BY s.sort_order, s.created_at, s.id',
    );
    expect(query.mock.calls[1][0]).not.toContain('deleted_at IS NULL');
    expect(query.mock.calls[2]).toEqual([
      expect.stringContaining("WHERE id = $2 AND content_markdown = ''"),
      ["A writer's story", 'legacy-id'],
    ]);
    expect(query.mock.calls[2][0]).not.toMatch(
      /SET (editor_intro|hero_narrative|published_at|published|sections)/,
    );
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('refuses a destructive rollback', async () => {
    await expect(new AddCityMarkdown1761800000000().down()).rejects.toThrow(
      'forward-only',
    );
  });
});
