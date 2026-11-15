import Link from "next/link"
import { Suspense } from "react"
import { getFavorites } from "@/lib/api"
import { ProductCard } from "@/components/product/product-card"

async function FavoriteList() {
  const res = await getFavorites()
  if (!res.ok) throw new Error(res.data.error ?? "Erro ao carregar os favoritos.")
  const { products } = res.data
  if (products.length === 0) return <p>Você ainda não favoritou nenhum produto. <Link href="/">Ver produtos</Link></p>
  const ids = products.map((p) => p.id).join(",")

  return (
    <ul className="grid">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} ids={ids} />
        </li>
      ))}
    </ul>
  )
}

export default function FavoritesPage() {
  return (
    <>
      <header className="page-header">
        <h1>Favoritos</h1>
      </header>
      <Suspense fallback={<p className="muted">Carregando…</p>}>
        <FavoriteList />
      </Suspense>
    </>
  )
}
