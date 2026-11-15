import { Button } from "@ui-sdk/react/button"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { api, type Product } from "@/lib/api"
import { addItem } from "../actions"
import { Prices } from "../cms"

async function ProductDetail({ searchParams }: Pick<PageProps<"/product">, "searchParams">) {
  const { id } = await searchParams
  const res = await api<Product>(`/product?id=${encodeURIComponent(String(id ?? ""))}`)
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error(res.data.error ?? "Erro ao carregar o produto.")
  const product = res.data

  return (
    <article className="product">
      <img src={product.images[0]} alt={product.name} width={600} height={600} />
      <div className="stack">
        <p className="muted">{product.brand}</p>
        <h1>{product.name}</h1>
        <Prices price={product.price} listPrice={product.listPrice} />
        <form action={addItem}>
          <input type="hidden" name="productId" value={product.id} />
          <Button type="submit">Adicionar à cesta</Button>
        </form>
        <p>{product.description}</p>
        <dl>
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key}>
              <dt className="muted">{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}

export default function ProductPage({ searchParams }: PageProps<"/product">) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <ProductDetail searchParams={searchParams} />
    </Suspense>
  )
}
