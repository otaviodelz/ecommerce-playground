import Link from "next/link"
import { Suspense } from "react"
import { getFavorites, type ProductCard as Card } from "@/lib/api"
import { setFavorite } from "@/lib/actions"
import { FavoriteToggle } from "./favorite-toggle"
import { Offer } from "./offer"

async function Favorite({ product }: { product: Card }) {
  const res = await getFavorites()
  const favorited = res.ok && res.data.products.some((p) => p.id === product.id)
  return <FavoriteToggle productId={product.id} name={product.name} favorited={favorited} action={setFavorite} />
}

function ProductCard({ product, ids }: { product: Card; ids: string }) {
  return (
    <article className="card">
      {/* Full prefetch: the default one fetches only the shared shell, so navigating would still show the fallback. */}
      <Link href={`/product/${product.id}`} prefetch>
        <img src={product.image} alt="" width={300} height={300} />
        <div className="card-body">
          <h3>{product.name}</h3>
          <p className="muted">{product.brand}</p>
        </div>
      </Link>
      {/* Per visitor like the price: a disabled heart holds the spot until the favorites load. */}
      <Suspense fallback={<FavoriteToggle productId={product.id} name={product.name} favorited={false} />}>
        <Favorite product={product} />
      </Suspense>
      <div className="card-offer">
        <Offer product={product} ids={ids} />
      </div>
    </article>
  )
}

export { ProductCard }
