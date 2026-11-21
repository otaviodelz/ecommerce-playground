import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import type { Basket, Offer, ProductCard } from "../api"
import { clientApi } from "./api"
import { currentLocation, saveLocation, useLocation } from "./location"
import { getSession } from "./session"

async function load<T>(path: string, warehouse?: string) {
  const res = await clientApi<T>(path, { warehouse })
  if (!res.ok) throw new Error(res.data.error ?? `API ${path} failed with ${res.status}`)
  return res.data
}

function useWarehouse() {
  const location = useLocation()
  return { ready: location !== undefined, warehouse: location?.warehouse ?? "" }
}

export const useAccountName = () => useQuery({ queryKey: ["session"], queryFn: async () => (await getSession()).name })

// One request per product and warehouse, sent only once `visible`; the same product twice on a page (two shelves) shares the query.
export function usePrice(id: string, visible: boolean) {
  const { ready, warehouse } = useWarehouse()
  return useQuery({
    queryKey: ["price", id, warehouse],
    queryFn: async () => (await load<{ prices: Record<string, Offer> }>(`/prices?ids=${encodeURIComponent(id)}`, warehouse)).prices[id] ?? null,
    enabled: ready && visible,
  })
}

export function useBasket() {
  const { ready, warehouse } = useWarehouse()
  return useQuery({ queryKey: ["basket", warehouse], queryFn: () => load<Basket>("/basket", warehouse), enabled: ready })
}

export const useFavorites = () => useQuery({ queryKey: ["favorites"], queryFn: () => load<{ products: ProductCard[] }>("/favorites") })

export const useSearch = (q: string) =>
  useQuery({ queryKey: ["search", q], queryFn: () => load<{ products: ProductCard[] }>(`/search?q=${encodeURIComponent(q)}`), enabled: q.length >= 2 })

// Each write puts the API's response straight into the cache, so the header counters, hearts and lists update together.
export function useStoreActions() {
  const queryClient = useQueryClient()
  const t = useTranslations("Errors")
  return {
    async addItem(productId: string): Promise<{ error?: string; locationRequired?: boolean }> {
      const warehouse = currentLocation()?.warehouse ?? ""
      const res = await clientApi<Basket>("/add-item", { body: { productId }, warehouse })
      // Not in stock in every warehouse and no CEP yet: the button asks for one, then calls this again.
      if (res.data.code === "location_required") return { locationRequired: true }
      if (res.data.code === "out_of_stock") return { error: t("outOfStock") }
      if (!res.ok) return { error: t("addItem") }
      queryClient.setQueryData(["basket", warehouse], res.data)
      return {}
    },
    async deleteItem(productId: string): Promise<{ error?: string }> {
      const warehouse = currentLocation()?.warehouse ?? ""
      const res = await clientApi<Basket>("/delete-item", { body: { productId }, warehouse })
      if (!res.ok) return { error: t("deleteItem") }
      queryClient.setQueryData(["basket", warehouse], res.data)
      return {}
    },
    async setFavorite(productId: string, favorite: boolean): Promise<{ error?: string }> {
      const res = await clientApi<{ products: ProductCard[] }>(favorite ? "/add-favorite" : "/delete-favorite", { body: { productId } })
      if (!res.ok) return { error: res.data.error ?? t("favorites") }
      queryClient.setQueryData(["favorites"], res.data)
      return {}
    },
    // Saving the location changes the warehouse in the price and basket keys, so those refetch on their own.
    async setLocation(form: FormData): Promise<{ error?: string }> {
      const cep = String(form.get("cep"))
      const res = await clientApi<{ warehouse: string }>("/set-location", { body: { cep } })
      if (!res.ok) return { error: res.status === 400 ? t("invalidCep") : t("saveCep") }
      saveLocation({ cep, warehouse: res.data.warehouse })
      return {}
    },
  }
}
