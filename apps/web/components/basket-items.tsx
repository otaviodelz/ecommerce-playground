"use client"

import { Button } from "@ui-sdk/react/button"
import Link from "next/link"
import { useState } from "react"
import { useBasket, useStoreActions } from "@/lib/client/queries"
import { brl } from "@/lib/format"

function BasketItems() {
  const basket = useBasket()
  const { deleteItem } = useStoreActions()
  const [error, setError] = useState("")

  if (basket.isPending) return <p>Carregando…</p>
  if (basket.isError) return <p role="alert" className="error">Não foi possível carregar a cesta.</p>
  const { items, subtotal } = basket.data
  if (items.length === 0) return <p>Sua cesta está vazia. <Link href="/">Ver produtos</Link></p>

  return (
    <>
      <ul className="basket">
        {items.map((item) => (
          <li key={item.id}>
            <img src={item.image} alt="" width={64} height={64} />
            <div>
              <Link href={`/product/${item.id}`}>{item.name}</Link>
              <p className="muted">
                {item.quantity} × {brl(item.price)} = {brl(item.total)}
              </p>
            </div>
            {/* Returning the Promise keeps the Button busy (and ignoring presses) until the removal settles. */}
            <Button onClick={async () => setError((await deleteItem(item.id)).error ?? "")} pendingAnnouncement="Removendo">
              Remover<span className="sr-only"> {item.name}</span>
            </Button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p className="price">Subtotal: {brl(subtotal)}</p>
    </>
  )
}

export { BasketItems }
