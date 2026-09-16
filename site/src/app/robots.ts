import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/preview/", "/account/", "/profile/", "/checkout/"],
    },
    sitemap: "https://culvoy.com/sitemap.xml",
  };
}
