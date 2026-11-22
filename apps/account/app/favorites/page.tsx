import { PageHeader } from "@playground/design-system/layout"
import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { FavoriteList } from "@/components/favorite-list"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function FavoritesPage() {
  const t = useTranslations("Nav")
  return (
    <>
      <PageHeader>
        <h1>{t("favorites")}</h1>
      </PageHeader>
      <FavoriteList />
    </>
  )
}
