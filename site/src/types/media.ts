export type MediaType = "image" | "video";

export type MediaAsset = {
  type: MediaType;
  url: string;
  poster?: string;
  alt?: string | { en?: string; zh?: string };
};

export function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MediaAsset>;
  return (
    (candidate.type === "image" || candidate.type === "video") &&
    typeof candidate.url === "string" &&
    Boolean(candidate.url.trim())
  );
}

export function resolvePrimaryMedia(
  value: unknown,
  legacyImage?: string | null,
): MediaAsset | null {
  if (isMediaAsset(value)) return { ...value };
  const fallback = legacyImage?.trim();
  return fallback ? { type: "image", url: fallback } : null;
}

export function resolveMediaGallery(
  value: unknown,
  legacyImages: Array<string | null | undefined> = [],
): MediaAsset[] {
  const authored = Array.isArray(value)
    ? value.filter(isMediaAsset).map((asset) => ({ ...asset }))
    : [];
  if (authored.length) return dedupeMedia(authored);

  return dedupeMedia(
    legacyImages
      .filter((url): url is string => Boolean(url?.trim()))
      .map((url) => ({ type: "image" as const, url })),
  );
}

export function mediaPoster(asset?: MediaAsset | null, fallback = ""): string {
  if (!asset) return fallback;
  return asset.type === "video" ? asset.poster?.trim() || fallback : asset.url;
}

export function localizedMediaAlt(
  asset: MediaAsset | null | undefined,
  locale: "en" | "zh",
  fallback: string,
): string {
  if (typeof asset?.alt === "string") return asset.alt || fallback;
  return asset?.alt?.[locale] || asset?.alt?.en || asset?.alt?.zh || fallback;
}

export function dedupeMedia(assets: MediaAsset[]): MediaAsset[] {
  const seen = new Set<string>();
  return assets.filter((asset) => {
    const key = `${asset.type}:${asset.url.trim()}`;
    if (!asset.url.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
