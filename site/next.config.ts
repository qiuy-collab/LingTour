import type { NextConfig } from "next";
import path from "path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isExport = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_BUILD === "1";
const isStandalone = process.env.NEXT_OUTPUT === "standalone";
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const apiOrigin = apiBase.startsWith("http")
  ? new URL(apiBase).origin
  : "http://localhost:8000";

const nextConfig: NextConfig = {
  output: isStandalone ? "standalone" : isExport ? "export" : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${apiOrigin}/api/:path*`,
    },
    {
      source: "/uploads/:path*",
      destination: `${apiOrigin}/uploads/:path*`,
    },
  ],
};

export default nextConfig;
