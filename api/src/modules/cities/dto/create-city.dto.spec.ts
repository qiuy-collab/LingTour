import { ValidationPipe } from '@nestjs/common';
import { CreateCityDto } from './create-city.dto';
import { UpdateCityDto } from './update-city.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: false },
});

describe('City Markdown DTO validation', () => {
  it('accepts a fresh empty English-only draft without legacy fields', async () => {
    const dto = await pipe.transform(
      { slug: 'new-city', name: '', contentMarkdown: '' },
      { type: 'body', metatype: CreateCityDto },
    );
    expect(dto.name).toBe('');
    expect(dto.contentMarkdown).toBe('');
  });

  it('keeps partial scalar translations and Markdown verbatim', async () => {
    const contentMarkdown = '# Heading\n\n![Image](/uploads/image.jpg)\n';
    const dto = await pipe.transform(
      { name: 'City', contentMarkdown },
      { type: 'body', metatype: UpdateCityDto },
    );
    expect(dto).toEqual(expect.objectContaining({ name: 'City', contentMarkdown }));
  });

  it.each([CreateCityDto, UpdateCityDto])(
    'rejects null, nonstring and oversized Markdown for %p',
    async (metatype) => {
      for (const contentMarkdown of [null, 42, {}, [], 'x'.repeat(200001)]) {
        await expect(
          pipe.transform(
            { slug: 'city', name: 'City', contentMarkdown },
            { type: 'body', metatype },
          ),
        ).rejects.toThrow();
      }
    },
  );

  it('accepts maximum length and rejects attempts to forge publication time', async () => {
    await expect(
      pipe.transform(
        { contentMarkdown: 'x'.repeat(200000) },
        { type: 'body', metatype: UpdateCityDto },
      ),
    ).resolves.toBeDefined();
    await expect(
      pipe.transform(
        { publishedAt: '2000-01-01T00:00:00Z' },
        { type: 'body', metatype: UpdateCityDto },
      ),
    ).rejects.toThrow();
  });

  it('rejects null or malformed city scalar metadata rather than erasing translations', async () => {
    for (const name of [null, 42, {}, []]) {
      await expect(
        pipe.transform({ name }, { type: 'body', metatype: UpdateCityDto }),
      ).rejects.toThrow();
    }
  });
});
