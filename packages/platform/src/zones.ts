import { API_URL } from "./config"

export type ZoneId = "discovery" | "pdp" | "cart-auth" | "account"

export type ZoneDefinition = {
  id: ZoneId
  squad: string
  port: number
  envVar: string
  assetPrefix?: string
  /** Exact or prefix route segments owned by this zone (excluding the discovery fallback). */
  routes: readonly string[]
}

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  discovery: {
    id: "discovery",
    squad: "Home e Busca",
    port: 3000,
    envVar: "DISCOVERY_ZONE_URL",
    routes: ["/", "/c", "/search", "/page"],
  },
  pdp: {
    id: "pdp",
    squad: "PDP",
    port: 3001,
    envVar: "PDP_ZONE_URL",
    assetPrefix: "/_pdp",
    routes: ["/product"],
  },
  "cart-auth": {
    id: "cart-auth",
    squad: "Login e Sacola",
    port: 3002,
    envVar: "CART_AUTH_ZONE_URL",
    assetPrefix: "/_cart",
    routes: ["/basket", "/login", "/api/session"],
  },
  account: {
    id: "account",
    squad: "Pós-Compra",
    port: 3003,
    envVar: "ACCOUNT_ZONE_URL",
    assetPrefix: "/_account",
    routes: ["/favorites"],
  },
} as const

export const ALL_ZONE_IDS: readonly ZoneId[] = ["discovery", "pdp", "cart-auth", "account"]

export function getZoneOrigin(zone: ZoneId, env: Record<string, string | undefined> = process.env): string {
  const def = ZONES[zone]
  return (env[def.envVar] ?? `http://localhost:${def.port}`).replace(/\/$/, "")
}

function normalizePathname(href: string): string | null {
  if (!href) return null
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href) || href.startsWith("//") || href.startsWith("#")) return null
  const withoutHash = href.split("#")[0] ?? ""
  const withoutQuery = withoutHash.split("?")[0] ?? ""
  if (!withoutQuery.startsWith("/")) return null
  return withoutQuery.length > 1 && withoutQuery.endsWith("/") ? withoutQuery.slice(0, -1) : withoutQuery
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * Resolves which Multi-Zone app owns a given storefront href/pathname.
 * Returns null for external URLs or hash-only links.
 */
export function resolveZone(href: string): ZoneId | null {
  const pathname = normalizePathname(href)
  if (!pathname) return null

  for (const id of ["pdp", "cart-auth", "account"] as const) {
    const def = ZONES[id]
    if (def.assetPrefix && matchesPrefix(pathname, def.assetPrefix)) return id
    if (def.routes.some((route) => matchesPrefix(pathname, route))) return id
  }

  // Root (/), categories (/c/*), search (/search), legacy /page, and dynamic CMS pages (/[cid]) belong to discovery.
  return "discovery"
}

export type ZoneRewrite = { source: string; destination: string }

/**
 * Generates `beforeFiles` rewrite rules for the primary zone (`apps/discovery`) so that
 * downstream zones and their prefixed static assets match BEFORE the catch-all `/[cid]` route.
 */
export function getZoneRewrites(env: Record<string, string | undefined> = process.env): ZoneRewrite[] {
  const rules: ZoneRewrite[] = []
  const apiUrl = (env.API_URL ?? API_URL).replace(/\/$/, "")

  for (const id of ["pdp", "cart-auth", "account"] as const) {
    const def = ZONES[id]
    const origin = getZoneOrigin(id, env)
    if (def.assetPrefix) {
      rules.push({ source: `${def.assetPrefix}/:path+`, destination: `${origin}${def.assetPrefix}/:path+` })
    }
    for (const route of def.routes) {
      rules.push({ source: route, destination: `${origin}${route}` })
      if (!route.startsWith("/api/")) {
        rules.push({ source: `${route}/:path+`, destination: `${origin}${route}/:path+` })
      }
    }
  }

  // CMS & catalog placeholder SVGs served by the backend API.
  rules.push({ source: "/images/:path*", destination: `${apiUrl}/images/:path*` })
  return rules
}

/**
 * Determines which zones cache a given revalidation tag so `/api/revalidate` can fan out accurately.
 */
export function getRevalidationTargets(tag: string): ZoneId[] {
  // Menu categories are rendered in the shared CategoryBar & Footer of every zone.
  if (tag === "/categories") return [...ALL_ZONE_IDS]
  if (tag === "prices" || tag.startsWith("/prices?") || tag.startsWith("/product?")) return ["pdp"]
  if (tag.startsWith("/page?") || tag.startsWith("/category?")) return ["discovery"]
  return [...ALL_ZONE_IDS]
}

export type SpeculationRules = {
  prerender?: { where: Record<string, unknown>; eagerness: "conservative" | "moderate" | "eager" }[]
  prefetch?: { where: Record<string, unknown>; eagerness: "conservative" | "moderate" | "eager" }[]
}

/**
 * Builds declarative Speculation Rules for cross-zone navigation from `currentZone`.
 * - Read/SEO zones (`pdp`, `discovery`) use `prerender` with `moderate` eagerness (hover/pointerdown only)
 *   so cross-zone clicks feel near-instant without eagerly prefetching every visible card.
 * - Transactional zones (`cart-auth`, `account`) use `prefetch` (document shell only, no background execution).
 */
export function getCrossZoneSpeculationRules(currentZone: ZoneId): SpeculationRules {
  const prerenderMatches: Record<string, unknown>[] = []
  const prefetchMatches: Record<string, unknown>[] = []

  if (currentZone !== "pdp") {
    prerenderMatches.push({ href_matches: "/product/*" })
  }
  if (currentZone !== "discovery") {
    prerenderMatches.push({ href_matches: "/" }, { href_matches: "/c/*" }, { href_matches: "/ofertas" }, { href_matches: "/novidades" })
  }
  if (currentZone !== "cart-auth") {
    prefetchMatches.push({ href_matches: "/basket" }, { href_matches: "/login" })
  }
  if (currentZone !== "account") {
    prefetchMatches.push({ href_matches: "/favorites" })
  }

  const exclude = { not: { or: [{ href_matches: "/api/*" }, { href_matches: "/*\\?*" }] } }

  return {
    ...(prerenderMatches.length > 0 && {
      prerender: [{ where: { and: [{ or: prerenderMatches }, exclude] }, eagerness: "moderate" }],
    }),
    ...(prefetchMatches.length > 0 && {
      prefetch: [{ where: { and: [{ or: prefetchMatches }, exclude] }, eagerness: "moderate" }],
    }),
  }
}
