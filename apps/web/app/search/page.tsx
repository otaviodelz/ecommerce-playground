import { Suspense } from "react"
import { api, type ProductCard as Card } from "@/lib/api"
import { ProductCard } from "@/components/product/product-card"

// Search results are per query, so they skip the content cache (unbounded keys) and go straight to the API.
async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const q = String((await searchParams).q ?? "").trim()
  if (q.length < 2) return <p className="muted">Digite pelo menos 2 letras para buscar.</p>

  const res = await api<{ products: Card[] }>(`/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error(res.data.error ?? "Erro na busca.")
  const { products } = res.data
  const ids = products.map((p) => p.id).join(",")

  return (
    <>
      <h1>
        {products.length} {products.length === 1 ? "resultado" : "resultados"} para “{q}”
      </h1>
      {products.length === 0 ? (
        <p className="muted">Tente outro termo, como “tênis” ou “mochila”.</p>
      ) : (
        <ul className="grid">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} ids={ids} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<p className="muted">Buscando…</p>}>
      <Results searchParams={searchParams} />
    </Suspense>
  )
}
