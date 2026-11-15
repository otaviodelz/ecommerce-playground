import type { NextConfig } from "next";
import { API_URL } from "./lib/config";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // CMS image paths like /images/tenis.svg are served by the API.
  rewrites: async () => [{ source: "/images/:path*", destination: `${API_URL}/images/:path*` }],
  // The CMS home is served at /, not at /[cid].
  redirects: async () => [{ source: "/home", destination: "/", permanent: true }],
  experimental: {
    // shortcut: every page is per-session (prices by warehouse cookie), so automatic instant-navigation
    // validation only reports a false "Client Component in a parent segment" error; opt pages in with `export const instant` if needed.
    instantInsights: { validationLevel: "manual-warning" },
  },
};

export default nextConfig;
