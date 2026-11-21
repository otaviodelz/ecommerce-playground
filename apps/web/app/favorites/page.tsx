import { PageHeader } from "@playground/design-system/layout"
import { useTranslations } from "next-intl"
import { FavoriteList } from "@/components/product/favorite-list"

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
