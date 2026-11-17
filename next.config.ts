import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder is the whole project. Without these, Next.js guesses the
  // root from the nearest lockfile, and a stray package-lock.json in a parent
  // folder (there was one in C:\Code) makes it treat every project there as
  // part of this site. The dev server then crawled about 42 GB and froze the
  // PC. Pinning both settings keeps them in agreement; on Railway, where the
  // project sits alone in /app, nothing changes.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
