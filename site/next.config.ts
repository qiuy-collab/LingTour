import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isExport = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_BUILD === "1";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: "http://localhost:8000/api/:path*",
    },
  ],
};

export default nextConfig;
