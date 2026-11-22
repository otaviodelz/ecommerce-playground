"use client"

import { AddToBasket } from "@playground/cart/add-to-basket"
import { useAddToBasket } from "@playground/cart/basket"
import { Badge } from "@playground/design-system/badge"
import { Skeleton } from "@playground/design-system/skeleton"
import { useInView } from "@playground/platform/client/use-in-view"
import { discountPercent, installments, money } from "@playground/platform/format"
import { useSetLocation } from "@playground/shipping/location"
import { useTranslations } from "next-intl"
import { usePrice, type PriceInfo } from "./pricing"

function Prices({ price, listPrice, overlayDiscount }: PriceInfo & { overlayDiscount?: boolean }) {
  const t = useTranslations("Offer")
  const discount = discountPercent(price, listPrice)
  const split = installments(price)
  return (
    <p className="mt-1.5 flex min-h-[2.6rem] flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="font-mono text-md">{money(price)}</span>
      {discount > 0 && (
        <>
          <s className="text-xs text-fg-3">
            <span className="sr-only">{t("listPrice")}</span>
            {money(listPrice)}
          </s>
          <Badge tone="accent" className={overlayDiscount ? "absolute top-2 left-2" : undefined}>
            -{discount}%
          </Badge>
        </>
      )}
      {split && <span className="basis-full text-xs text-fg-3">{t("installments", { count: split.count, value: money(split.value) })}</span>}
    </p>
  )
}

type OfferProps = { product: { id: string; name: string }; label?: string; className?: string; eager?: boolean; overlayDiscount?: boolean }

// Price, stock and the add button depend on the visitor's warehouse, so they load in the browser, starting 200px
// before the offer reaches the viewport so scrolling rarely catches the skeleton; it keeps their size so the layout doesn't shift.
function Offer({ product, label: customLabel, className, eager = false, overlayDiscount = false }: OfferProps) {
  const t = useTranslations("Offer")
  const label = customLabel ?? t("add")
  const [ref, inView] = useInView<HTMLDivElement>("200px")
  const price = usePrice(product.id, eager || inView)
  const addItem = useAddToBasket()
  const setLocation = useSetLocation()

  if (price.isPending) {
    return (
      <div ref={ref} className={className}>
        <Skeleton render={<p />} className="mt-1.5 min-h-[2.6rem] w-32">
          <span className="sr-only">{t("loadingPrice")}</span>
        </Skeleton>
        <AddToBasket productId={product.id} name={product.name} label={label} available />
      </div>
    )
  }

  const offer = price.data
  // Pricing outage: keep the button, add-item's own stock check decides.
  const available = offer?.available ?? true
  return (
    <div ref={ref} className={className}>
      {!offer ? (
        <p className="mt-1.5 flex min-h-[2.6rem] items-baseline text-fg-3">{t("priceUnavailable")}</p>
      ) : available ? (
        <Prices {...offer} overlayDiscount={overlayDiscount} />
      ) : (
        <p className="mt-1.5 flex min-h-[2.6rem] items-baseline font-mono text-fg-3">{t("outOfStock")}</p>
      )}
      <AddToBasket productId={product.id} name={product.name} label={label} available={available} add={addItem} setLocation={setLocation} />
    </div>
  )
}

export { Offer }
