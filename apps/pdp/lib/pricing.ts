import type { Offer } from "@playground/catalog/pricing"
import { serverFetch } from "@playground/platform/api"
import { cacheLife, cacheTag } from "next/cache"

// Owned by apps/pdp (Squad: PDP).
// The offer a visitor without a CEP sees (default warehouse, stock in any warehouse): what crawlers and link previews
// get in the PDP's HTML. Cached for minutes; tag "prices" refreshes every product at once. null on a pricing outage.
export async function getDefaultOffer(id: string): Promise<Offer | null> {
  "use cache"
  const path = `/prices?ids=${encodeURIComponent(id)}`
  cacheTag(path, "prices")
  cacheLife("minutes")
  try {
    const res = await serverFetch(path)
    return res.ok ? (((await res.json()) as { prices: Record<string, Offer> }).prices[id] ?? null) : null
  } catch (error) {
    console.error(error)
    return null
  }
}
