import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Culvoy",
    short_name: "Culvoy",
    description:
      "Story routes through Guangdong's three cultures — with a local interpreter at your side.",
    start_url: "/",
    display: "browser",
    background_color: "#ece9e2",
    theme_color: "#ece9e2",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
