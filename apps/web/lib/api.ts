import { cookies } from "next/headers"
import { API_URL } from "./config"

export type ProductCard = { id: string; name: string; brand: string; image: string; price: number; listPrice: number }
export type Block =
  | { type: "banner"; id: string; image: string; link: string }
  | { type: "shelf"; id: string; title: string; products: ProductCard[] }
export type Product = Omit<ProductCard, "image"> & { description: string; images: string[]; specs: Record<string, string> }
export type Basket = { items: (ProductCard & { quantity: number; total: number })[]; subtotal: number }

// Server-only: forwards the session cookies (set by proxy.ts and the actions) to the API.
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
