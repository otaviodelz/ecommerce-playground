import { Favorite } from "@playground/favorites/favorite-toggle"
import type { ProductCard as Card } from "@playground/platform/api"
import { ServerZoneLink } from "@playground/platform/zone-link"
import { ZoneLink } from "@playground/platform/zone-navigation"
import type { ZoneId } from "@playground/platform/zones"
import { Offer } from "./offer"

// Content (name, image, link) is static; the heart and the offer are per visitor and load in the browser.
// Passing `zone` resolves cross-zone product links on the server as plain <a> tags with zero client boundary overhead.
function ProductCard({ product, zone, priority = false }: { product: Card; zone?: ZoneId; priority?: boolean }) {
  const linkContent = (
    <>
      <img
        src={product.image}
        alt=""
        width={300}
        height={300}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="aspect-square w-full border-b border-line object-cover"
      />
      <div className="flex flex-col gap-0.5 px-3 pt-3">
        <h3 className="font-sans font-medium tracking-normal">{product.name}</h3>
        <p className="text-fg-3">{product.brand}</p>
      </div>
    </>
  )

  return (
    <article className="relative flex h-full flex-col border border-line bg-surface">
      {zone ? (
        <ServerZoneLink zone={zone} href={`/product/${product.id}`} className="block no-underline">
          {linkContent}
        </ServerZoneLink>
      ) : (
        <ZoneLink href={`/product/${product.id}`} className="block no-underline">
          {linkContent}
        </ZoneLink>
      )}
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
