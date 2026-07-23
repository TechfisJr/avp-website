import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
