import { cacheLife, cacheTag } from "next/cache"
import { API_URL } from "./config"
import { expiresSoon, tokenExpiry } from "./token"

export type ProductCard = { id: string; name: string; brand: string; image: string }
export type BannerSlide = { image: string; link: string; alt: string }
export type Block =
  | { type: "hero"; id: string; title: string; text: string; actions: { label: string; link: string }[]; slides: BannerSlide[] }
  | { type: "banner"; id: string; slides: BannerSlide[] }
  | { type: "shelf"; id: string; title: string; products: ProductCard[] }
  | { type: "info-bar"; id: string; text: string; link?: string }
  | { type: "categories"; id: string; title: string; items: { label: string; description: string; link: string }[] }
  | { type: "benefits"; id: string; items: { title: string; description: string }[] }
type CategoryRef = { id: string; name: string }
export type Product = Omit<ProductCard, "image"> & {
  category: CategoryRef
  subcategory: CategoryRef
  description: string
  images: string[]
  specs: Record<string, string>
}
export type Category = CategoryRef & { description: string; parent?: CategoryRef; products: ProductCard[] }
export type MenuCategory = CategoryRef & { subcategories: CategoryRef[] }
export type PriceInfo = { price: number; listPrice: number }
// Stock comes with the price: in the visitor's warehouse, or in any warehouse while they haven't given a CEP.
export type Offer = PriceInfo & { available: boolean }
export type Basket = { items: (ProductCard & PriceInfo & { quantity: number; total: number })[]; subtotal: number }

// The server's own guest session: content is the same for everyone and is built with no visitor around,
// but the API wants an access token on every call.
let serverSession: { token: Promise<string>; expiresAt: number } | undefined

function serverToken(renew: boolean) {
  if (renew || !serverSession || expiresSoon(serverSession.expiresAt)) {
    const token = fetch(API_URL + "/guest-login", { method: "POST" }).then(async (res) => {
      if (!res.ok) throw new Error(`API /guest-login failed with ${res.status}`)
      return ((await res.json()) as { accessToken: string }).accessToken
    })
    const session = { token, expiresAt: Infinity } // Infinity while in flight, so concurrent calls share it
    serverSession = session
    token.then(
      (t) => (session.expiresAt = tokenExpiry(t)),
      () => serverSession === session && (serverSession = undefined),
    )
  }
  return serverSession.token
}

// Same for every visitor, so it's cached and lands in the static HTML. Tagged by path for revalidation (app/api/revalidate).
export async function getContent<T>(path: string) {
  "use cache"
  cacheTag(path)
  cacheLife("hours")
  const request = async (renew: boolean) => fetch(API_URL + path, { headers: { authorization: `Bearer ${await serverToken(renew)}` } })
  let res = await request(false)
  if (res.status === 401) res = await request(true)
  if (res.status >= 500 || res.status === 401) throw new Error(`API ${path} failed with ${res.status}`)
  return { status: res.status, data: (await res.json()) as T }
}
