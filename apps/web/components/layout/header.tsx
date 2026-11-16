"use client"

import { createInputController, Input } from "@ui-sdk/react/input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import Form from "next/form"
import Link from "next/link"
import { useState } from "react"
import { useLocation } from "@/lib/client/location"
import { useAccountName, useBasket, useFavorites, useStoreActions } from "@/lib/client/queries"
import { CepForm, type FormAction } from "../forms"

function SearchForm() {
  const [input] = useState(createInputController)
  useShortcut("/", () => input.focus(), { description: "Buscar produtos" })
  const hint = useShortcutHint("/")
  return (
    <Form action="/search" className="search" role="search">
      <kbd aria-hidden="true">/</kbd>
      <Input controller={input} type="search" name="q" aria-label="Buscar produtos" placeholder="buscar produtos" aria-keyshortcuts={hint.ariaKeyshortcuts} />
    </Form>
  )
}

function CepPopover({ action, cep }: { action: FormAction; cep?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="cep-trigger" aria-label={`CEP de entrega: ${cep ?? "não informado"}`}>
        cep <strong>{cep ?? "informar"}</strong>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Onde entregar?</PopoverTitle>
        <PopoverDescription className="muted">O preço e o estoque mudam conforme o CEP.</PopoverDescription>
        <CepForm action={action} defaultCep={cep} onSuccess={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

// Per visitor, so it fills in from the browser; the static HTML ships it with empty counters.
function Session() {
  const location = useLocation()
  const name = useAccountName().data
  const basket = useBasket().data
  const favorites = useFavorites().data
  const { setLocation } = useStoreActions()
  const count = basket?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const favoriteCount = favorites?.products.length ?? 0
  return (
    <div className="session">
      <CepPopover action={setLocation} cep={location?.cep} />
      {name ? <span>olá, {name.split(" ")[0].toLowerCase()}</span> : <Link href="/login">entrar</Link>}
      <Link href="/favorites" aria-label={`Favoritos, ${favoriteCount} ${favoriteCount === 1 ? "produto" : "produtos"}`}>
        favoritos <span className="count">[{favoriteCount}]</span>
      </Link>
      <Link href="/basket" aria-label={`Cesta, ${count} ${count === 1 ? "item" : "itens"}`}>
        cesta <span className="count">[{count}]</span>
      </Link>
    </div>
  )
}

export { CepPopover, SearchForm, Session }
