/**
 * Every media kind the site renders. `live` is a live photo: it arrives through
 * the same upload endpoint as an image and is displayed from its first frame,
 * so it is its own kind — not a video.
 */
export type MediaType = "image" | "video" | "live";

export type MediaAsset = {
  type: MediaType;
  url: string;
  poster?: string;
  alt?: string;
};

export function isMediaAsset(value: unknown): value is MediaAsset {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MediaAsset>;
  return (
    (candidate.type === "image" ||
      candidate.type === "video" ||
      candidate.type === "live") &&
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

/**
 * Static frame for a media asset. A still image is its own poster; anything
 * that renders through a `<video>` element (video, live photo) needs an
 * explicit poster and falls back to the caller's placeholder when the record
 * carries none.
 */
export function mediaPoster(asset?: MediaAsset | null, fallback = ""): string {
  if (!asset) return fallback;
  return asset.type === "image"
    ? asset.url
    : asset.poster?.trim() || fallback;
}

export function mediaAlt(
  asset: MediaAsset | null | undefined,
  fallback: string,
): string {
  return asset?.alt || fallback;
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
