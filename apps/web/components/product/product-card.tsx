import Link from "next/link"
import type { ProductCard as Card } from "@/lib/api"
import { Favorite } from "./favorite-toggle"
import { Offer } from "./offer"

// Content (name, image, link) is static; the heart and the offer are per visitor and load in the browser.
function ProductCard({ product }: { product: Card }) {
  return (
    <article className="relative flex h-full flex-col border border-line bg-surface">
      <Link href={`/product/${product.id}`} className="block no-underline">
        <img src={product.image} alt="" width={300} height={300} className="aspect-square w-full border-b border-line object-cover" />
        <div className="flex flex-col gap-0.5 px-3 pt-3">
          <h3 className="font-sans font-medium tracking-normal">{product.name}</h3>
          <p className="text-fg-3">{product.brand}</p>
        </div>
      </Link>
      <Favorite productId={product.id} name={product.name} />
      <Offer
        product={product}
        overlayDiscount
        className="flex flex-1 flex-col gap-3 px-3 pb-3 [&>[data-slot=button]]:mt-auto [&>[data-slot=button]]:w-full"
      />
    </article>
  )
}

export { ProductCard }
