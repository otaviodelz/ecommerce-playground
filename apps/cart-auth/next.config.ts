import { ZONES } from "@playground/platform/zones"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  assetPrefix: ZONES["cart-auth"].assetPrefix,
  // Intentionally excludes @playground/catalog so catalog/pricing changes never invalidate cart-auth builds.
  transpilePackages: [
    "@playground/design-system",
    "@playground/platform",
    "@playground/shipping",
    "@playground/cart",
    "@playground/favorites",
    "@playground/shell",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    instantInsights: { validationLevel: "manual-warning" },
  },
}

export default createNextIntlPlugin()(nextConfig)
