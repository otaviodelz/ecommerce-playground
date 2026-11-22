import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { BasketItems } from "@/components/basket-items"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function BasketPage() {
  const t = useTranslations("Nav")
  return (
    <>
      <h1>{t("basket")}</h1>
      <BasketItems />
    </>
  )
}
