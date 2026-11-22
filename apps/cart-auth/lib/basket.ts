import { cartQueryKeys, type Basket } from "@playground/cart/basket"
import { clientApi } from "@playground/platform/client/api"
import { currentLocation } from "@playground/shipping/location"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

// Owned by apps/cart-auth (Squad: Login e Sacola); updates the shared basket cache key so the Header counter stays in sync.
export function useDeleteBasketItem() {
  const queryClient = useQueryClient()
  const t = useTranslations("Errors")
  return async (productId: string): Promise<{ error?: string }> => {
    const warehouse = currentLocation()?.warehouse ?? ""
    const res = await clientApi<Basket>("/delete-item", { body: { productId }, warehouse })
    if (!res.ok) return { error: t("deleteItem") }
    queryClient.setQueryData(cartQueryKeys.basket(warehouse), res.data)
    return {}
  }
}
