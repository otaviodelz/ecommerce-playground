export const API_URL = process.env.API_URL ?? "http://localhost:3333"
// The storefront's public address: canonical links, Open Graph and JSON-LD need absolute URLs.
export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000"
// Each country is its own build on its own domain, so the market is fixed per deploy (NEXT_PUBLIC_ so client code reads it too).
const markets = { br: { locale: "pt-BR", currency: "BRL" } } as const
export const market = markets[(process.env.NEXT_PUBLIC_MARKET ?? "br") as keyof typeof markets]
if (!market) throw new Error(`Unknown NEXT_PUBLIC_MARKET "${process.env.NEXT_PUBLIC_MARKET}"`)
// A page's openGraph replaces the layout's instead of merging, so every page spreads these in.
export const openGraphBase = { siteName: "Playground Store", locale: market.locale.replace("-", "_") }
// What the browser calls: per-visitor data (prices, basket, favorites, search, CEP) goes straight to the API.
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const
