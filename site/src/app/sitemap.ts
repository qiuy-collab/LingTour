import type { MetadataRoute } from "next";

/**
 * Static core routes for crawler discovery. Detail pages (culture entries,
 * routes, shop products) are discovered by crawling public links and are not
 * listed here so the sitemap stays a build-time artifact with no API
 * dependency.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://culvoy.com";

  // A build-time constant, not `new Date()`. Recomputing it on every build told
  // crawlers "every page changed today", every deploy — which trains them to
  // ignore the signal entirely. Bump this when the core routes actually change.
  const lastModified = new Date("2026-09-18T00:00:00.000Z");

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/culture`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/routes`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/interpreting`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/shop`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/community`, lastModified, changeFrequency: "daily", priority: 0.7 },
  ];
}
