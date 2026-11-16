import { Suspense } from "react"
import { SearchResults } from "@/components/product/search-results"

// useSearchParams needs the boundary: the page shell is static, the query is read in the browser.
export default function SearchPage() {
  return (
    <Suspense fallback={<p className="muted">Buscando…</p>}>
      <SearchResults />
    </Suspense>
  )
}
