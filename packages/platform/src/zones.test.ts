import { expect, test } from "vitest"
import { getCrossZoneSpeculationRules, getRevalidationTargets, getZoneRewrites, resolveZone } from "./zones"

test("resolveZone maps every storefront route to its owning squad zone", () => {
  expect(resolveZone("/")).toBe("discovery")
  expect(resolveZone("/ofertas")).toBe("discovery")
  expect(resolveZone("/novidades")).toBe("discovery")
  expect(resolveZone("/c/corrida")).toBe("discovery")
  expect(resolveZone("/search?q=tenis")).toBe("discovery")
  expect(resolveZone("/page?cid=ofertas")).toBe("discovery")

  expect(resolveZone("/product/tenis-runner")).toBe("pdp")
  expect(resolveZone("/product?id=tenis-runner")).toBe("pdp")
  expect(resolveZone("/_pdp/_next/static/chunk.js")).toBe("pdp")

  expect(resolveZone("/basket")).toBe("cart-auth")
  expect(resolveZone("/login")).toBe("cart-auth")
  expect(resolveZone("/api/session")).toBe("cart-auth")
  expect(resolveZone("/_cart/_next/static/chunk.js")).toBe("cart-auth")

  expect(resolveZone("/favorites")).toBe("account")
  expect(resolveZone("/_account/_next/static/chunk.js")).toBe("account")

  expect(resolveZone("https://example.com")).toBeNull()
  expect(resolveZone("#top")).toBeNull()
})

test("getZoneRewrites generates prefixed static asset and route rules ahead of CMS fallback", () => {
  const rewrites = getZoneRewrites({
    PDP_ZONE_URL: "https://pdp.internal",
    CART_AUTH_ZONE_URL: "https://cart.internal",
    ACCOUNT_ZONE_URL: "https://account.internal",
    API_URL: "https://api.internal",
  })

  expect(rewrites).toContainEqual({ source: "/_pdp/:path+", destination: "https://pdp.internal/_pdp/:path+" })
  expect(rewrites).toContainEqual({ source: "/product/:path+", destination: "https://pdp.internal/product/:path+" })
  expect(rewrites).toContainEqual({ source: "/basket", destination: "https://cart.internal/basket" })
  expect(rewrites).toContainEqual({ source: "/login", destination: "https://cart.internal/login" })
  expect(rewrites).toContainEqual({ source: "/api/session", destination: "https://cart.internal/api/session" })
  expect(rewrites).toContainEqual({ source: "/favorites", destination: "https://account.internal/favorites" })
  expect(rewrites).toContainEqual({ source: "/images/:path*", destination: "https://api.internal/images/:path*" })
})

test("getRevalidationTargets routes shared and domain tags to the right zones", () => {
  expect(getRevalidationTargets("/categories")).toEqual(["discovery", "pdp", "cart-auth", "account"])
  expect(getRevalidationTargets("prices")).toEqual(["pdp"])
  expect(getRevalidationTargets("/prices?ids=tenis-runner")).toEqual(["pdp"])
  expect(getRevalidationTargets("/product?id=tenis-runner")).toEqual(["pdp"])
  expect(getRevalidationTargets("/page?cid=home")).toEqual(["discovery"])
  expect(getRevalidationTargets("/category?id=corrida")).toEqual(["discovery"])
})

test("getCrossZoneSpeculationRules targets only peer zones with moderate eagerness", () => {
  const fromDiscovery = getCrossZoneSpeculationRules("discovery")
  expect(JSON.stringify(fromDiscovery.prerender)).toContain("/product/*")
  expect(JSON.stringify(fromDiscovery.prerender)).not.toContain("/c/*")
  expect(JSON.stringify(fromDiscovery.prefetch)).toContain("/basket")
  expect(JSON.stringify(fromDiscovery.prefetch)).toContain("/favorites")

  const fromPdp = getCrossZoneSpeculationRules("pdp")
  expect(JSON.stringify(fromPdp.prerender)).toContain("/c/*")
  expect(JSON.stringify(fromPdp.prerender)).not.toContain("/product/*")
  expect(fromPdp.prerender?.[0]?.eagerness).toBe("moderate")
})
