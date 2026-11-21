"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useFavorites } from "@/lib/client/queries"
import { ProductCard } from "./product-card"

function FavoriteList() {
  const t = useTranslations("Favorites")
  const common = useTranslations("Common")
  const favorites = useFavorites()
  if (favorites.isPending) return <p className="text-fg-3">{common("loading")}</p>
  if (favorites.isError) return <p role="alert" className="text-sm text-destructive">{t("loadError")}</p>
  const { products } = favorites.data
  if (products.length === 0) return <p>{t("empty")} <Link href="/">{common("seeProducts")}</Link></p>
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3 p-0">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

export { FavoriteList }
