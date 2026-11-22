import type { ProductCard } from "@playground/platform/api"
import { clientApi, clientLoad } from "@playground/platform/client/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

// Owned by Squad: Pós-Compra.
export const favoritesQueryKeys = {
  all: () => ["favorites"] as const,
} as const

export const useFavorites = () =>
  useQuery({
    queryKey: favoritesQueryKeys.all(),
    queryFn: () => clientLoad<{ products: ProductCard[] }>("/favorites"),
  })

export function useSetFavorite() {
  const queryClient = useQueryClient()
  const t = useTranslations("Errors")
  return async (productId: string, favorite: boolean): Promise<{ error?: string }> => {
    const res = await clientApi<{ products: ProductCard[] }>(favorite ? "/add-favorite" : "/delete-favorite", { body: { productId } })
    if (!res.ok) return { error: res.data.error ?? t("favorites") }
    queryClient.setQueryData(favoritesQueryKeys.all(), res.data)
    return {}
  }
}
