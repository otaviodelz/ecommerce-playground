"use client"

import { Input, createInputController } from "@playground/design-system/input"
import { Kbd } from "@playground/design-system/kbd"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@playground/design-system/popover"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { useTranslations } from "next-intl"
import Form from "next/form"
import Link from "next/link"
import { useState } from "react"
import { useLocation } from "@/lib/client/location"
import { useAccountName, useBasket, useFavorites, useStoreActions } from "@/lib/client/queries"
import { CepForm, type FormAction } from "../forms"

function SearchForm() {
  const t = useTranslations("Header")
  const [input] = useState(createInputController)
  useShortcut("/", () => input.focus(), { description: t("search") })
  const hint = useShortcutHint("/")
  return (
    <Form action="/search" className="relative flex flex-[1_1_16rem] items-center gap-2" role="search">
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
    </Form>
  )
}

function CepPopover({ action, cep }: { action: FormAction; cep?: string }) {
  const t = useTranslations("Header")
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="h-auto border-0 bg-transparent p-0 font-[inherit] text-fg-2 no-underline hover:bg-transparent hover:text-fg"
        aria-label={t("cepLabel", { cep: cep ?? t("cepUnknown") })}
      >
        {t("cep")} <strong className="font-normal text-fg underline">{cep ?? t("cepEmpty")}</strong>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>{t("cepTitle")}</PopoverTitle>
        <PopoverDescription className="text-fg-3">{t("cepDescription")}</PopoverDescription>
        <CepForm action={action} defaultCep={cep} onSuccess={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

// Per visitor, so it fills in from the browser; the static HTML ships it with empty counters.
function Session() {
  const t = useTranslations("Header")
  const location = useLocation()
  const name = useAccountName().data
  const basket = useBasket().data
  const favorites = useFavorites().data
  const { setLocation } = useStoreActions()
  const count = basket?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const favoriteCount = favorites?.products.length ?? 0
  return (
    <div className="flex items-center gap-4 font-mono text-[0.8rem] text-fg-2 sm:gap-5">
      <CepPopover action={setLocation} cep={location?.cep} />
      {name ? (
        <span>{t("hello", { name: name.split(" ")[0].toLowerCase() })}</span>
      ) : (
        <Link href="/login" className="text-fg-2 no-underline hover:text-fg">
          {t("signIn")}
        </Link>
      )}
      <Link href="/favorites" className="text-fg-2 no-underline hover:text-fg" aria-label={t("favoritesLabel", { count: favoriteCount })}>
        {t("favorites")} <span className="text-accent">[{favoriteCount}]</span>
      </Link>
      <Link href="/basket" className="text-fg-2 no-underline hover:text-fg" aria-label={t("basketLabel", { count })}>
        {t("basket")} <span className="text-accent">[{count}]</span>
      </Link>
    </div>
  )
}

export { CepPopover, SearchForm, Session }
