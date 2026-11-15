import { Button } from "@ui-sdk/react/button"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, type Product } from "@/lib/api"
import { addItem } from "../actions"
import { Price } from "../price"

async function ProductDetail({ searchParams }: Pick<PageProps<"/product">, "searchParams">) {
  const { id } = await searchParams
  const res = await getContent<Product>(`/product?id=${encodeURIComponent(String(id ?? ""))}`)
  if (res.status === 404) notFound()
  const product = res.data

  return (
    <article className="product">
      <img src={product.images[0]} alt={product.name} width={600} height={600} />
      <div className="stack">
        <p className="muted">{product.brand}</p>
        <h1>{product.name}</h1>
        <Price id={product.id} />
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

// searchParams is request data, so the page body streams; the product content itself comes from the cache.
export default function ProductPage({ searchParams }: PageProps<"/product">) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <ProductDetail searchParams={searchParams} />
    </Suspense>
  )
}
