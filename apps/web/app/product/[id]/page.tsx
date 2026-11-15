import { Button } from "@ui-sdk/react/button"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, type Product } from "@/lib/api"
import { addItem } from "../../actions"
import { Price } from "../../price"

async function ProductDetail({ params }: Pick<PageProps<"/product/[id]">, "params">) {
  const { id } = await params
  const res = await getContent<Product>(`/product?id=${encodeURIComponent(id)}`)
  if (res.status === 404) notFound()
  const product = res.data

  return (
    <article className="product">
      <img src={product.images[0]} alt={product.name} width={600} height={600} />
      <div className="stack">
        <p className="muted mono">{product.brand}</p>
        <h1>{product.name}</h1>
        <Price id={product.id} />
        <form action={addItem}>
          <input type="hidden" name="productId" value={product.id} />
          <Button type="submit" data-variant="solid">
            Adicionar à cesta
          </Button>
        </form>
        <p className="muted">{product.description}</p>
        <dl className="specs">
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

// No generateStaticParams: nothing is built per product. The shell is static, the product renders per request from cached content.
export default function ProductPage({ params }: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <ProductDetail params={params} />
    </Suspense>
  )
}
