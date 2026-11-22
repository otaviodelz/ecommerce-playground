"use client"

import { useAccountName } from "@playground/cart/account"
import { useBasket } from "@playground/cart/basket"
import { Input, createInputController } from "@playground/design-system/input"
import { Kbd } from "@playground/design-system/kbd"
import { useFavorites } from "@playground/favorites/client"
import { ZoneForm, ZoneLink } from "@playground/platform/zone-navigation"
import { CepPopover } from "@playground/shipping/cep-popover"
import { useLocation, useSetLocation } from "@playground/shipping/location"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { useTranslations } from "next-intl"
import { useState } from "react"

function SearchForm() {
  const t = useTranslations("Header")
  const [input] = useState(createInputController)
  useShortcut("/", () => input.focus(), { description: t("search") })
  const hint = useShortcutHint("/")
  return (
    <ZoneForm action="/search" className="relative flex flex-[1_1_16rem] items-center gap-2" role="search">
      <Kbd aria-hidden="true" className="pointer-events-none absolute start-2.5">
        /
      </Kbd>
      <Input
        mono
        controller={input}
        type="search"
        name="q"
        className="w-full ps-9"
        aria-label={t("search")}
        placeholder={t("searchPlaceholder")}
        aria-keyshortcuts={hint.ariaKeyshortcuts}
      />
    </ZoneForm>
  )
}

// Composes squad-owned header slots: Entrega (CepPopover), Login e Sacola (session + basket), Pós-Compra (favorites).
function Session() {
  const t = useTranslations("Header")
  const location = useLocation()
  const name = useAccountName().data
  const basket = useBasket().data
  const favorites = useFavorites().data
  const setLocation = useSetLocation()
  const count = basket?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const favoriteCount = favorites?.products.length ?? 0
  return (
    <div className="flex items-center gap-4 font-mono text-[0.8rem] text-fg-2 sm:gap-5">
      <CepPopover action={setLocation} cep={location?.cep} />
      {name ? (
        <span>{t("hello", { name: name.split(" ")[0].toLowerCase() })}</span>
      ) : (
        <ZoneLink href="/login" className="text-fg-2 no-underline hover:text-fg">
          {t("signIn")}
        </ZoneLink>
      )}
      <ZoneLink href="/favorites" className="text-fg-2 no-underline hover:text-fg" aria-label={t("favoritesLabel", { count: favoriteCount })}>
        {t("favorites")} <span className="text-accent">[{favoriteCount}]</span>
      </ZoneLink>
      <ZoneLink href="/basket" className="text-fg-2 no-underline hover:text-fg" aria-label={t("basketLabel", { count })}>
        {t("basket")} <span className="text-accent">[{count}]</span>
      </ZoneLink>
    </div>
  )
}

export { SearchForm, Session }
