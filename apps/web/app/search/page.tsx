import { useTranslations } from "next-intl"
import { Suspense } from "react"
import { SearchResults } from "@/components/product/search-results"

// useSearchParams needs the boundary: the page shell is static, the query is read in the browser.
export default function SearchPage() {
  const t = useTranslations("Search")
  return (
    <Suspense fallback={<p className="text-fg-3">{t("searching")}</p>}>
      <SearchResults />
    </Suspense>
  )
}
