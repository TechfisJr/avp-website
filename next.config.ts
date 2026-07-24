import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three ships untranspiled ESM in some subpaths; let Next handle it
  transpilePackages: ["three"],
};

export default nextConfig;
