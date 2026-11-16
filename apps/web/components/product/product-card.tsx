import Link from "next/link"
import type { ProductCard as Card } from "@/lib/api"
import { Favorite } from "./favorite-toggle"
import { Offer } from "./offer"

// Content (name, image, link) is static; the heart and the offer are per visitor and load in the browser.
function ProductCard({ product }: { product: Card }) {
  return (
    <article className="card">
      <Link href={`/product/${product.id}`}>
        <img src={product.image} alt="" width={300} height={300} />
        <div className="card-body">
          <h3>{product.name}</h3>
          <p className="muted">{product.brand}</p>
        </div>
      </Link>
      <Favorite productId={product.id} name={product.name} />
      <Offer product={product} className="card-offer" />
    </article>
  )
}

export { ProductCard }
