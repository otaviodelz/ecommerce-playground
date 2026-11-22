"use client"

import { useBasket } from "@playground/cart/basket"
import { Button } from "@playground/design-system/button"
import { money } from "@playground/platform/format"
import { ZoneLink } from "@playground/platform/zone-navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useDeleteBasketItem } from "@/lib/basket"

function BasketItems() {
  const t = useTranslations("Basket")
  const common = useTranslations("Common")
  const basket = useBasket()
  const deleteItem = useDeleteBasketItem()
  const [error, setError] = useState("")

  if (basket.isPending) return <p>{common("loading")}</p>
  if (basket.isError) return <p role="alert" className="text-sm text-destructive">{t("loadError")}</p>
  const { items, subtotal } = basket.data
  if (items.length === 0) return <p>{t("empty")} <ZoneLink href="/">{common("seeProducts")}</ZoneLink></p>

  return (
    <>
      <ul className="m-0 list-none border-t border-line p-0">
        {items.map((item) => (
          <li key={item.id} className="grid grid-cols-[4rem_1fr_auto] items-center gap-4 border-b border-line py-3">
            <img src={item.image} alt="" width={64} height={64} loading="lazy" decoding="async" className="border border-line" />
            <div>
              <ZoneLink href={`/product/${item.id}`}>{item.name}</ZoneLink>
              <p className="text-fg-3">
                {item.quantity} × {money(item.price)} = {money(item.total)}
              </p>
            </div>
            {/* Returning the Promise keeps the Button busy (and ignoring presses) until the removal settles. */}
            <Button onClick={async () => setError((await deleteItem(item.id)).error ?? "")} pendingAnnouncement={t("removing")}>
              {t("remove")}<span className="sr-only"> {item.name}</span>
            </Button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="font-mono text-md">{t("subtotal", { value: money(subtotal) })}</p>
    </>
  )
}

export { BasketItems }
