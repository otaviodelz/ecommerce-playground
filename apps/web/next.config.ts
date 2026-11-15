import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // shortcut: every page is per-session (prices by warehouse cookie), so automatic instant-navigation
    // validation only reports a false "Client Component in a parent segment" error; opt pages in with `export const instant` if needed.
    instantInsights: { validationLevel: "manual-warning" },
  },
};

export default nextConfig;
