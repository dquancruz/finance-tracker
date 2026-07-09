import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Modern, smaller formats first — Next falls back automatically for
    // browsers that don't support them.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Google OAuth profile pictures (next-auth `session.user.image`) —
      // no avatar is rendered with next/image yet, but allow-listing this
      // now means one is optimized for free the moment a UI adds it.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    // Only import the recharts submodules actually used instead of the
    // whole barrel file, shrinking both server and client bundles.
    optimizePackageImports: ["recharts"],
  },
};

export default nextConfig;
