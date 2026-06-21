import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // @react-pdf/renderer's pdfkit references Node-only `canvas`/`encoding`
    // that are unused in our build. Stub them so client/SSR bundles compile.
    resolveAlias: {
      canvas: { browser: "./empty-module.ts" },
      encoding: { browser: "./empty-module.ts" },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
