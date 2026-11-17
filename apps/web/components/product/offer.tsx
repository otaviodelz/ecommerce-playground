"use client"

import type { PriceInfo } from "@/lib/api"
import { usePrice, useStoreActions } from "@/lib/client/queries"
import { useInView } from "@/lib/client/use-in-view"
import { brl, discountPercent, installments } from "@/lib/format"
import { AddToBasket } from "./add-to-basket"

function Prices({ price, listPrice }: PriceInfo) {
  const discount = discountPercent(price, listPrice)
  const split = installments(price)
  return (
    <p className="prices">
      <span className="price">{brl(price)}</span>
      {discount > 0 && (
        <>
          <s className="list-price">
            <span className="sr-only">de </span>
            {brl(listPrice)}
          </s>
          <span className="discount">-{discount}%</span>
        </>
      )}
      {split && (
        <span className="installments">
          {split.count}x de {brl(split.value)} sem juros
        </span>
      )}
    </p>
  )
}

type OfferProps = { product: { id: string; name: string }; label?: string; className?: string; eager?: boolean }

// Price, stock and the add button depend on the visitor's warehouse, so they load in the browser, starting 200px
// before the offer reaches the viewport so scrolling rarely catches the skeleton; it keeps their size so the layout doesn't shift.
// `eager` skips that wait, for an offer that is always on screen.
function Offer({ product, label = "Adicionar", className, eager = false }: OfferProps) {
  const [ref, inView] = useInView<HTMLDivElement>("200px")
  const price = usePrice(product.id, eager || inView)
  const { addItem, setLocation } = useStoreActions()

  if (price.isPending) {
    return (
      <div ref={ref} className={className}>
        <p className="prices price-skeleton">
          <span className="sr-only">Carregando preço</span>
        </p>
        <AddToBasket productId={product.id} name={product.name} label={label} available />
      </div>
    )
  }

  const offer = price.data
  // Pricing outage: keep the button, add-item's own stock check decides.
  const available = offer?.available ?? true
  return (
    <div ref={ref} className={className}>
      {!offer ? (
        <p className="prices muted">Preço indisponível</p>
      ) : available ? (
        <Prices {...offer} />
      ) : (
        <p className="prices out-of-stock">Sem estoque</p>
      )}
      <AddToBasket productId={product.id} name={product.name} label={label} available={available} add={addItem} setLocation={setLocation} />
    </div>
  )
}

export { Offer }
