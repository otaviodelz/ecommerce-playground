import { getZoneRewrites } from "@playground/platform/zones"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@playground/design-system",
    "@playground/platform",
    "@playground/shipping",
    "@playground/cart",
    "@playground/favorites",
    "@playground/catalog",
    "@playground/shell",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  // beforeFiles ensures downstream zones (/product, /basket, /login, /favorites, /api/session and their
  // prefixed static assets) match BEFORE this zone's catch-all /[cid] CMS route.
  rewrites: async () => ({
    beforeFiles: getZoneRewrites(),
  }),
  // The CMS home is served at /, not at /[cid].
  redirects: async () => [{ source: "/home", destination: "/", permanent: true }],
  experimental: {
    instantInsights: { validationLevel: "manual-warning" },
  },
}

export default createNextIntlPlugin()(nextConfig)
