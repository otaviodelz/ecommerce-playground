import { useQuery, useQueryClient } from "@tanstack/react-query"
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

// Every Offer on a page passes the page's full id list, so they share one query: one /prices call per page and warehouse.
export function usePrices(ids: string) {
  const { ready, warehouse } = useWarehouse()
  return useQuery({
    queryKey: ["prices", ids, warehouse],
    queryFn: async () => (await load<{ prices: Record<string, Offer> }>(`/prices?ids=${encodeURIComponent(ids)}`, warehouse)).prices,
    enabled: ready && ids !== "",
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
  return {
    async addItem(productId: string): Promise<{ error?: string; locationRequired?: boolean }> {
      const warehouse = currentLocation()?.warehouse ?? ""
      const res = await clientApi<Basket>("/add-item", { body: { productId }, warehouse })
      // Not in stock in every warehouse and no CEP yet: the button asks for one, then calls this again.
      if (res.data.code === "location_required") return { locationRequired: true }
      if (res.data.code === "out_of_stock") return { error: "Sem estoque para o seu CEP." }
      if (!res.ok) return { error: "Não foi possível adicionar o item." }
      queryClient.setQueryData(["basket", warehouse], res.data)
      return {}
    },
    async deleteItem(productId: string): Promise<{ error?: string }> {
      const warehouse = currentLocation()?.warehouse ?? ""
      const res = await clientApi<Basket>("/delete-item", { body: { productId }, warehouse })
      if (!res.ok) return { error: "Não foi possível remover o item." }
      queryClient.setQueryData(["basket", warehouse], res.data)
      return {}
    },
    async setFavorite(productId: string, favorite: boolean): Promise<{ error?: string }> {
      const res = await clientApi<{ products: ProductCard[] }>(favorite ? "/add-favorite" : "/delete-favorite", { body: { productId } })
      if (!res.ok) return { error: res.data.error ?? "Não foi possível atualizar os favoritos." }
      queryClient.setQueryData(["favorites"], res.data)
      return {}
    },
    // Saving the location changes the warehouse in the price and basket keys, so those refetch on their own.
    async setLocation(form: FormData): Promise<{ error?: string }> {
      const cep = String(form.get("cep"))
      const res = await clientApi<{ warehouse: string }>("/set-location", { body: { cep } })
      if (!res.ok) return { error: res.status === 400 ? "CEP inválido. Use 00000-000." : "Não foi possível salvar o CEP." }
      saveLocation({ cep, warehouse: res.data.warehouse })
      return {}
    },
  }
}
