import { Suspense } from "react"
import { brl, getPrice, type PriceInfo } from "@/lib/api"

function Prices({ price, listPrice }: PriceInfo) {
  return (
    <p className="prices">
      {listPrice > price && <s className="list-price">{brl(listPrice)}</s>} <span className="price">{brl(price)}</span>
    </p>
  )
}

async function WarehousePrice({ id, ids }: { id: string; ids: string }) {
  const prices = await getPrice(id, ids)
  return prices ? <Prices {...prices} /> : <p className="prices muted">Preço indisponível</p>
}

// Only the price depends on the visitor's warehouse; the skeleton keeps its size so the layout doesn't shift.
function Price({ id, ids = id }: { id: string; ids?: string }) {
  return (
    <Suspense
      fallback={
        <p className="prices price-skeleton">
          <span className="sr-only">Carregando preço</span>
        </p>
      }
    >
      <WarehousePrice id={id} ids={ids} />
    </Suspense>
  )
}

export { Price, Prices }
