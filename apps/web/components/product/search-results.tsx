"use client"

import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useSearch } from "@/lib/client/queries"
import { ProductCard } from "./product-card"

// Per query, so it isn't static content: results load in the browser, cached per term by react-query.
function SearchResults() {
  const t = useTranslations("Search")
  const q = (useSearchParams().get("q") ?? "").trim()
  const search = useSearch(q)

  if (q.length < 2) return <p className="text-fg-3">{t("tooShort")}</p>
  if (search.isPending) return <p className="text-fg-3">{t("searching")}</p>
  if (search.isError) return <p role="alert" className="text-sm text-destructive">{t("error")}</p>
  const { products } = search.data

  return (
    <>
      <h1>{t("results", { count: products.length, q })}</h1>
      {products.length === 0 ? (
        <p className="text-fg-3">{t("noResults")}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3 p-0">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export { SearchResults }
