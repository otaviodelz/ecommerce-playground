import type { ProductCard } from "@playground/platform/api"
import { clientLoad } from "@playground/platform/client/api"
import { useQuery } from "@tanstack/react-query"

// Owned exclusively by apps/discovery (Squad: Home e Busca).
export const useSearch = (q: string) =>
  useQuery({
    queryKey: ["search", q] as const,
    queryFn: () => clientLoad<{ products: ProductCard[] }>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length >= 2,
  })
