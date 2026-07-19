export const MEDIA_TYPES = ['image', 'video'] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export interface MediaAsset {
  type: MediaType;
  url: string;
  poster?: string;
  alt?: { en: string; zh: string };
}

export function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<MediaAsset>;
  return (
    MEDIA_TYPES.includes(candidate.type as MediaType) &&
    typeof candidate.url === 'string' &&
    candidate.url.trim().length > 0
  );
}

export function resolvePrimaryMedia(
  media: MediaAsset | null | undefined,
  legacyImage?: string | null,
): MediaAsset | null {
  if (isMediaAsset(media)) return media;

  const fallback = legacyImage?.trim();
  return fallback ? { type: 'image', url: fallback } : null;
}

export function resolveMediaGallery(
  media: MediaAsset[] | null | undefined,
  legacyImages?: string[] | null,
): MediaAsset[] {
  const validMedia = Array.isArray(media) ? media.filter(isMediaAsset) : [];
  if (validMedia.length > 0) return validMedia;

  return (legacyImages ?? [])
    .filter(
      (url): url is string => typeof url === 'string' && Boolean(url.trim()),
    )
    .map((url) => ({ type: 'image' as const, url }));
}
