import { clientLoad } from "@playground/platform/client/api"
import { useWarehouse } from "@playground/shipping/location"
import { useQuery } from "@tanstack/react-query"

export type PriceInfo = { price: number; listPrice: number }
// Stock comes with the price: in the visitor's warehouse, or in any warehouse while they haven't given a CEP.
export type Offer = PriceInfo & { available: boolean }

// Owned by Squad: PDP / Catálogo.
export const pricingQueryKeys = {
  price: (id: string, warehouse: string) => ["price", id, warehouse] as const,
} as const

// One request per product and warehouse, sent only once `visible`; the same product twice on a page shares the query.
export function usePrice(id: string, visible: boolean) {
  const { ready, warehouse } = useWarehouse()
  return useQuery({
    queryKey: pricingQueryKeys.price(id, warehouse),
    queryFn: async () => (await clientLoad<{ prices: Record<string, Offer> }>(`/prices?ids=${encodeURIComponent(id)}`, warehouse)).prices[id] ?? null,
    enabled: ready && visible,
  })
}
