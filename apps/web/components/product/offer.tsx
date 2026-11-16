"use client"

import type { PriceInfo } from "@/lib/api"
import { usePrices, useStoreActions } from "@/lib/client/queries"
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

type OfferProps = { product: { id: string; name: string }; ids?: string; label?: string }

// Price, stock and the add button depend on the visitor's warehouse, so they load in the browser;
// the skeleton keeps their size so the layout doesn't shift.
function Offer({ product, ids = product.id, label = "Adicionar" }: OfferProps) {
  const prices = usePrices(ids)
  const { addItem, setLocation } = useStoreActions()

  if (prices.isPending) {
    return (
      <>
        <p className="prices price-skeleton">
          <span className="sr-only">Carregando preço</span>
        </p>
        <AddToBasket productId={product.id} name={product.name} label={label} available />
      </>
    )
  }

  const offer = prices.data?.[product.id]
  // Pricing outage: keep the button, add-item's own stock check decides.
  const available = offer?.available ?? true
  return (
    <>
      {!offer ? (
        <p className="prices muted">Preço indisponível</p>
      ) : available ? (
        <Prices {...offer} />
      ) : (
        <p className="prices out-of-stock">Sem estoque</p>
      )}
      <AddToBasket productId={product.id} name={product.name} label={label} available={available} add={addItem} setLocation={setLocation} />
    </>
  )
}

export { Offer }
