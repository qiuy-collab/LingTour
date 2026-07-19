import { describe, expect, it } from "vitest";
import {
  localizedMediaAlt,
  mediaPoster,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "./media";

describe("mixed media helpers", () => {
  it("keeps authored video metadata and exposes its poster", () => {
    const media = resolvePrimaryMedia(
      {
        type: "video",
        url: "/uploads/routes/arrival.mp4",
        poster: "/uploads/routes/arrival.webp",
      },
      "/legacy.jpg",
    );

    expect(media).toEqual({
      type: "video",
      url: "/uploads/routes/arrival.mp4",
      poster: "/uploads/routes/arrival.webp",
    });
    expect(mediaPoster(media, "/legacy.jpg")).toBe(
      "/uploads/routes/arrival.webp",
    );
  });

  it("falls back to legacy image fields during migration", () => {
    expect(resolvePrimaryMedia(null, "/legacy.jpg")).toEqual({
      type: "image",
      url: "/legacy.jpg",
    });
  });

  it("prefers authored gallery media and removes duplicates", () => {
    expect(
      resolveMediaGallery(
        [
          { type: "video", url: "/clip.mp4", poster: "/clip.webp" },
          { type: "video", url: "/clip.mp4", poster: "/clip.webp" },
          { type: "image", url: "/detail.webp" },
        ],
        ["/legacy.jpg"],
      ),
    ).toEqual([
      { type: "video", url: "/clip.mp4", poster: "/clip.webp" },
      { type: "image", url: "/detail.webp" },
    ]);
  });

  it("selects localized alt text with a stable fallback", () => {
    const media = {
      type: "image" as const,
      url: "/detail.webp",
      alt: { en: "Temple detail", zh: "古寺细节" },
    };

    expect(localizedMediaAlt(media, "zh", "Fallback")).toBe("古寺细节");
    expect(localizedMediaAlt(media, "en", "Fallback")).toBe(
      "Temple detail",
    );
    expect(localizedMediaAlt(null, "en", "Fallback")).toBe("Fallback");
  });
});
