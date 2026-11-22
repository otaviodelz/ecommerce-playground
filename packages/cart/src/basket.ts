import type { ProductCard } from "@playground/platform/api"
import { clientApi, clientLoad } from "@playground/platform/client/api"
import { currentLocation, useWarehouse } from "@playground/shipping/location"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

export type BasketItem = ProductCard & { price: number; listPrice: number; quantity: number; total: number }
export type Basket = { items: BasketItem[]; subtotal: number }

// Owned by Squad: Login e Sacola.
export const cartQueryKeys = {
  basket: (warehouse: string) => ["basket", warehouse] as const,
} as const

// Cross-zone basket read contract (Header counter in every zone + /basket page in apps/cart-auth).
export function useBasket() {
  const { ready, warehouse } = useWarehouse()
  return useQuery({
    queryKey: cartQueryKeys.basket(warehouse),
    queryFn: () => clientLoad<Basket>("/basket", warehouse),
    enabled: ready,
  })
}

// Cross-zone add-to-basket contract (used by <Offer> in discovery, pdp and account; writes straight into the shared basket cache).
// Basket-page-only mutations (e.g. deleteItem) live locally inside apps/cart-auth.
export function useAddToBasket() {
  const queryClient = useQueryClient()
  const t = useTranslations("Errors")
  return async (productId: string): Promise<{ error?: string; locationRequired?: boolean }> => {
    const warehouse = currentLocation()?.warehouse ?? ""
    const res = await clientApi<Basket>("/add-item", { body: { productId }, warehouse })
    // Not in stock in every warehouse and no CEP yet: the button asks for one, then calls this again.
    if (res.data.code === "location_required") return { locationRequired: true }
    if (res.data.code === "out_of_stock") return { error: t("outOfStock") }
    if (!res.ok) return { error: t("addItem") }
    queryClient.setQueryData(cartQueryKeys.basket(warehouse), res.data)
    return {}
  }
}
