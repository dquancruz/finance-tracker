import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // CSP is set in middleware with a per-request nonce. A static
    // `script-src` here would AND with that policy and block nonce scripts.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
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
