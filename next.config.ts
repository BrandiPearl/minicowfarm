import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "pub-05999fee5eae416089a1c557475ec570.r2.dev" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "highlandminicows.com" },
    ],
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

