"use client"

import { useSearchParams } from "next/navigation"
import { useSearch } from "@/lib/client/queries"
import { ProductCard } from "./product-card"

// Per query, so it isn't static content: results load in the browser, cached per term by react-query.
function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim()
  const search = useSearch(q)

  if (q.length < 2) return <p className="muted">Digite pelo menos 2 letras para buscar.</p>
  if (search.isPending) return <p className="muted">Buscando…</p>
  if (search.isError) return <p role="alert" className="error">Erro na busca.</p>
  const { products } = search.data
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

export { SearchResults }
