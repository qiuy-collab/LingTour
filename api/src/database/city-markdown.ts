// Frozen conversion for migration 1761800000000; never used during normal saves.
type LegacyRecord = Record<string, unknown>;

function record(value: unknown): LegacyRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as LegacyRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function english(value: unknown): string {
  return text(record(value).en);
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function label(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/([\\`*_[\]{}()#!|])/g, '\\$1')
    .replace(/\r?\n/g, ' ');
}

function mediaReference(
  urlValue: unknown,
  caption: string,
  image: boolean,
): string {
  const url = text(urlValue).trim();
  if (!url) return '';
  // Never turn a legacy javascript:, data:, protocol-relative or malformed URL
  // into active Markdown. Its original value remains readable and in the DB.
  if (
    Array.from(url).some(
      (character) =>
        character.charCodeAt(0) < 32 ||
        character.charCodeAt(0) === 127 ||
        character === '\\',
    ) ||
    (!/^https?:\/\//i.test(url) && !/^\/(?!\/)/.test(url))
  ) {
    return `${label(caption)}: ${label(url)}`;
  }
  const destination = url.replace(/[\s<>"'`()[\]{}]/g, (char) =>
    encodeURIComponent(char).replace(
      /[!'()*]/g,
      (value) => `%${value.charCodeAt(0).toString(16).toUpperCase()}`,
    ),
  );
  return `${image ? '!' : ''}[${label(caption)}](<${destination}>)`;
}

function media(assetValue: unknown, caption: string): string[] {
  const asset = record(assetValue);
  const alt = english(asset.alt) || caption;
  return [
    mediaReference(asset.url, alt, asset.type !== 'video'),
    mediaReference(asset.poster, `${alt} poster`, true),
  ];
}

function gallery(images: unknown, assets: unknown, caption: string): string[] {
  return [
    ...list(images).map((image) => mediaReference(image, caption, true)),
    ...list(assets).flatMap((asset) => media(asset, caption)),
  ];
}

function join(parts: string[]): string {
  const mediaCaptions = new Map<string, Set<string>>();
  return parts
    .map((part) => {
      const reference = /^(!?)\[(.*)\]\(<([^>\n]+)>\)$/.exec(part);
      if (!reference) return part;
      const [, image, caption, url] = reference;
      const key = `${image}:${url}`;
      const captions = mediaCaptions.get(key);
      if (!captions) {
        mediaCaptions.set(key, new Set([caption]));
        return part;
      }
      if (captions.has(caption)) return '';
      // Keep distinct legacy alt/caption metadata without rendering media twice.
      captions.add(caption);
      return caption;
    })
    .filter((part) => part.trim())
    .join('\n\n');
}

/** Additive English migration: legacy JSON and every media source stay intact. */
export function legacyCityToMarkdown(city: LegacyRecord): string {
  const parts = [english(city.editor_intro), english(city.hero_narrative)];
  const cityName = english(city.name) || 'City';
  parts.push(
    mediaReference(city.hero_image, cityName, true),
    ...media(city.hero_media, cityName),
    ...gallery(city.gallery_images, city.gallery_media, `${cityName} gallery`),
  );

  // Copy before sorting; conversion must not mutate the legacy record.
  const sections = list(city.sections)
    .map(record)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  for (const section of sections) {
    const title = english(section.title);
    const statLabel = english(section.stat_label);
    const statValue = english(section.stat_value);
    const quote = english(section.breath_quote);
    parts.push(
      title ? `## ${label(title)}` : '',
      english(section.body),
      statLabel || statValue
        ? `${statLabel ? `**${label(statLabel)}**` : ''}${statLabel && statValue ? ': ' : ''}${label(statValue)}`
        : '',
      mediaReference(section.image, title || 'Section image', true),
      ...media(section.primary_media, title || 'Section media'),
      ...gallery(section.images, section.media, title || 'Section gallery'),
      mediaReference(section.breath_image, title || 'Section image', true),
      quote
        ? quote
            .split(/\r?\n/)
            .map((line) => `> ${line}`)
            .join('\n')
        : '',
    );
  }

  const foodTitle = english(city.food_title);
  parts.push(
    foodTitle ? `## ${label(foodTitle)}` : '',
    english(city.food_description),
    ...gallery(city.food_images, [], foodTitle || 'Food'),
  );
  return join(parts);
}
