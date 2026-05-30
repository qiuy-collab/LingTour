import type { CityCulture } from "@/data/culture";
import type { Region } from "@/types/content";

const PLACEHOLDER_TAGS = new Set(["qq", "qqq", "test", "todo", "draft"]);

function toTitleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hasMeaningfulText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return false;
  if (/^q+$/i.test(trimmed)) return false;
  if (/^(test|todo|draft)$/i.test(trimmed)) return false;
  return true;
}

export function sanitizeTags(tags: string[] | null | undefined) {
  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim())
        .filter(
          (tag) =>
            hasMeaningfulText(tag) && !PLACEHOLDER_TAGS.has(tag.toLowerCase()),
        ),
    ),
  );
}

export function sanitizeCityCulture(city: CityCulture): CityCulture {
  const fallbackName = hasMeaningfulText(city.name)
    ? city.name.trim()
    : toTitleFromSlug(city.slug);
  const fallbackLabel = hasMeaningfulText(city.label)
    ? city.label.trim()
    : fallbackName;

  return {
    ...city,
    name: fallbackName,
    label: fallbackLabel,
    summary: city.summary?.trim() ?? "",
    narrative: city.narrative?.trim() ?? "",
    tags: sanitizeTags(city.tags),
  };
}

export function hasVisibleCityContent(city: CityCulture) {
  return Boolean(
    hasMeaningfulText(city.name) &&
      (hasMeaningfulText(city.summary) ||
        hasMeaningfulText(city.narrative) ||
        city.routeSlugs.length > 0 ||
        city.gallery.length > 0 ||
        city.foodImages.length > 0 ||
        hasMeaningfulText(city.image)),
  );
}

export function sanitizeRegion(region: Region): Region {
  const fallbackName = hasMeaningfulText(region.name)
    ? region.name.trim()
    : toTitleFromSlug(region.slug);
  const fallbackLabel = hasMeaningfulText(region.label)
    ? region.label.trim()
    : fallbackName;

  return {
    ...region,
    name: fallbackName,
    label: fallbackLabel,
    summary: region.summary?.trim() ?? "",
    narrative: region.narrative?.trim() ?? "",
    tags: sanitizeTags(region.tags),
  };
}

export function hasVisibleRegionContent(region: Region) {
  return Boolean(
    hasMeaningfulText(region.name) &&
      (hasMeaningfulText(region.summary) ||
        hasMeaningfulText(region.narrative) ||
        region.routeSlugs.length > 0 ||
        region.gallery.length > 0 ||
        hasMeaningfulText(region.image)),
  );
}
