import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, type Category, type MenuCategory } from "@/lib/api"
import { ProductCard } from "@/components/product/product-card"

async function CategoryListing({ params }: Pick<PageProps<"/c/[id]">, "params">) {
  const { id } = await params
  const res = await getContent<Category>(`/category?id=${encodeURIComponent(id)}`)
  if (res.status === 404) notFound()
  const { name, description, parent, products } = res.data
  const ids = products.map((p) => p.id).join(",")

  return (
    <>
      <header className="page-header">
        {parent && (
          <nav className="breadcrumb" aria-label="Você está em">
            <Link href={`/c/${parent.id}`} prefetch>{parent.name}</Link> › {name}
          </nav>
        )}
        <h1>{name}</h1>
        <p className="muted">{description}</p>
        <p className="muted mono">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
      </header>
      <ul className="grid">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} ids={ids} />
          </li>
        ))}
      </ul>
    </>
  )
}

// Every category and subcategory is built (there are few); one added later works like an unlisted product:
// fallback on its first visit, then served complete. See app/product/[id]/page.tsx.
export async function generateStaticParams() {
  const { data } = await getContent<{ categories: MenuCategory[] }>("/categories")
  return data.categories.flatMap((c) => [c, ...c.subcategories]).map(({ id }) => ({ id }))
}

export default function CategoryPage({ params }: PageProps<"/c/[id]">) {
  return (
    <Suspense fallback={<p className="muted">Carregando…</p>}>
      <CategoryListing params={params} />
    </Suspense>
  )
}
