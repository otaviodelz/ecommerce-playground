"use client"

import { createInputController, Input } from "@ui-sdk/react/input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import Form from "next/form"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import type { FormAction } from "./actions"
import { CepForm } from "./forms"

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

const categories = [
  { label: "Início", href: "/" },
  { label: "Corrida", href: "/page?cid=corrida" },
  { label: "Acessórios", href: "/page?cid=acessorios" },
  { label: "Eletrônicos", href: "/page?cid=eletronicos" },
  { label: "Novidades", href: "/page?cid=novidades" },
  { label: "Ofertas", href: "/page?cid=ofertas", deal: true },
]

function CategoryLinks({ current }: { current?: string }) {
  return (
    <nav className="catbar" aria-label="Categorias">
      {categories.map((c) => (
        <Link key={c.href} href={c.href} className={c.deal ? "deal" : undefined} aria-current={c.href === current ? "page" : undefined}>
          {c.label}
        </Link>
      ))}
    </nav>
  )
}

// Reads the URL on the client, so the layout stays static; the Suspense fallback is the same bar without a current item.
function CategoryBar() {
  const pathname = usePathname()
  const cid = useSearchParams().get("cid")
  return <CategoryLinks current={pathname === "/page" ? `/page?cid=${cid}` : pathname} />
}

export { CategoryBar, CategoryLinks, CepPopover, SearchForm }
