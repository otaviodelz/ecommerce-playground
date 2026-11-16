"use client"

import Link from "next/link"
import { useFavorites } from "@/lib/client/queries"
import { ProductCard } from "./product-card"

function FavoriteList() {
  const favorites = useFavorites()
  if (favorites.isPending) return <p className="muted">Carregando…</p>
  if (favorites.isError) return <p role="alert" className="error">Não foi possível carregar os favoritos.</p>
  const { products } = favorites.data
  if (products.length === 0) return <p>Você ainda não favoritou nenhum produto. <Link href="/">Ver produtos</Link></p>
  return (
    <ul className="grid">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

export { FavoriteList }
