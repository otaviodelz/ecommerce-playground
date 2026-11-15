import { Button } from "@ui-sdk/react/button"
import Link from "next/link"
import { Suspense } from "react"
import { api, brl, type Basket } from "@/lib/api"
import { deleteItem } from "../actions"

async function BasketItems() {
  const res = await api<Basket>("/basket")
  if (!res.ok) throw new Error(res.data.error ?? "Erro ao carregar a cesta.")
  const { items, subtotal } = res.data
  if (items.length === 0) return <p>Sua cesta está vazia. <Link href="/">Ver produtos</Link></p>

  return (
    <>
      <ul className="basket">
        {items.map((item) => (
          <li key={item.id}>
            <img src={item.image} alt="" width={64} height={64} />
            <div>
              <Link href={`/product?id=${item.id}`}>{item.name}</Link>
              <p className="muted">
                {item.quantity} × {brl(item.price)} = {brl(item.total)}
              </p>
            </div>
            <form action={deleteItem}>
              <input type="hidden" name="productId" value={item.id} />
              <Button type="submit">
                Remover<span className="sr-only"> {item.name}</span>
              </Button>
            </form>
          </li>
        ))}
      </ul>
      <p className="price">Subtotal: {brl(subtotal)}</p>
    </>
  )
}

export default function BasketPage() {
  return (
    <>
      <h1>Cesta</h1>
      <Suspense fallback={<p>Carregando…</p>}>
        <BasketItems />
      </Suspense>
    </>
  )
}
