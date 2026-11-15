import { Suspense } from "react"
import { brl, discountPercent, getPrice, installments, type PriceInfo } from "@/lib/api"
import { addItem, setLocation } from "@/lib/actions"
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

async function WarehouseOffer({ product, ids, label }: Required<OfferProps>) {
  const offer = await getPrice(product.id, ids)
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

// Price, stock and the add button depend on the visitor's warehouse; the skeleton keeps their size so the layout doesn't shift.
function Offer({ product, ids = product.id, label = "Adicionar" }: OfferProps) {
  return (
    <Suspense
      fallback={
        <>
          <p className="prices price-skeleton">
            <span className="sr-only">Carregando preço</span>
          </p>
          <AddToBasket productId={product.id} name={product.name} label={label} available />
        </>
      }
    >
      <WarehouseOffer product={product} ids={ids} label={label} />
    </Suspense>
  )
}

export { Offer, Prices }
