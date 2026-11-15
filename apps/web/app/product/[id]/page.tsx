import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, type Product } from "@/lib/api"
import { Offer } from "@/components/product/offer"

async function ProductDetail({ params }: Pick<PageProps<"/product/[id]">, "params">) {
  const { id } = await params
  const res = await getContent<Product>(`/product?id=${encodeURIComponent(id)}`)
  if (res.status === 404) notFound()
  const product = res.data

  return (
    <article className="product">
      <img src={product.images[0]} alt={product.name} width={600} height={600} />
      <div className="stack">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href={`/c/${product.category.id}`} prefetch>{product.category.name}</Link> ›{" "}
          <Link href={`/c/${product.subcategory.id}`} prefetch>{product.subcategory.name}</Link> › {product.brand}
        </nav>
        <h1>{product.name}</h1>
        <div className="offer">
          <Offer product={product} label="Adicionar à cesta" />
        </div>
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

// ISR with Cache Components: one real product is built (Cache Components requires at least one, and rendering a real
// page lets the build check the route); any other product gets the fallback on its first visit, then is rendered in the
// background and served complete from then on. params stays awaited inside the Suspense so that fallback shell exists.
export async function generateStaticParams() {
  return [{ id: "tenis-runner" }]
}

export default function ProductPage({ params }: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <ProductDetail params={params} />
    </Suspense>
  )
}
