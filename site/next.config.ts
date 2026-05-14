import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
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
      destination: "http://localhost:3001/api/:path*",
    },
  ],
};

export default nextConfig;
