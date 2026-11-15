import { cacheLife, cacheTag } from "next/cache"
import { cookies } from "next/headers"
import { cache } from "react"
import { API_URL } from "./config"

export type ProductCard = { id: string; name: string; brand: string; image: string }
export type BannerSlide = { image: string; link: string; alt: string }
export type Block =
  | { type: "hero"; id: string; title: string; text: string; actions: { label: string; link: string }[]; slides: BannerSlide[] }
  | { type: "banner"; id: string; slides: BannerSlide[] }
  | { type: "shelf"; id: string; title: string; products: ProductCard[] }
  | { type: "info-bar"; id: string; text: string; link?: string }
  | { type: "categories"; id: string; title: string; items: { label: string; description: string; link: string }[] }
  | { type: "benefits"; id: string; items: { title: string; description: string }[] }
export type Product = Omit<ProductCard, "image"> & { description: string; images: string[]; specs: Record<string, string> }
export type PriceInfo = { price: number; listPrice: number }
export type Basket = { items: (ProductCard & PriceInfo & { quantity: number; total: number })[]; subtotal: number }

// Same for every visitor, so it's cached and lands in the static HTML. Tagged by path for revalidation (app/api/revalidate).
export async function getContent<T>(path: string) {
  "use cache"
  cacheTag(path)
  cacheLife("hours")
  const res = await fetch(API_URL + path)
  if (res.status >= 500) throw new Error(`API ${path} failed with ${res.status}`)
  return { status: res.status, data: (await res.json()) as T }
}

async function fetchPrices(ids: string, warehouse: string) {
  "use cache"
  cacheTag("prices")
  cacheLife("minutes")
  const res = await fetch(`${API_URL}/prices?ids=${encodeURIComponent(ids)}`, { headers: warehouse ? { warehouse } : {} })
  if (!res.ok) throw new Error(`API /prices failed with ${res.status}`)
  return ((await res.json()) as { prices: Record<string, PriceInfo> }).prices
}

// Every Price slot on a page passes the page's full id list, so React.cache makes it one request per page.
const pricesFor = cache(fetchPrices)

// A pricing outage hides prices, not the page. cookies() stays outside the try so Next's render signals aren't swallowed.
export async function getPrice(id: string, ids: string): Promise<PriceInfo | undefined> {
  const warehouse = (await cookies()).get("wh")?.value ?? ""
  try {
    return (await pricesFor(ids, warehouse))[id]
  } catch (error) {
    console.error(error)
    return undefined
  }
}

// Session-bound calls (basket, login, CEP): forwards the cookies set by proxy.ts and the actions.
export async function api<T>(path: string, body?: unknown) {
  const jar = await cookies()
  const headers: Record<string, string> = { "content-type": "application/json" }
  const warehouse = jar.get("wh")?.value
  const token = jar.get("at")?.value
  if (warehouse) headers.warehouse = warehouse
  if (token) headers.authorization = `Bearer ${token}`

  const res = await fetch(API_URL + path, body === undefined ? { headers } : { method: "POST", headers, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data: data as T & { error?: string } }
}

export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Up to 10 interest-free installments of at least R$ 10; null when it can't be split.
export function installments(cents: number) {
  const count = Math.min(10, Math.floor(cents / 1000))
  return count >= 2 ? { count, value: Math.round(cents / count) } : null
}

export const discountPercent = (price: number, listPrice: number) =>
  listPrice > price ? Math.round((1 - price / listPrice) * 100) : 0
