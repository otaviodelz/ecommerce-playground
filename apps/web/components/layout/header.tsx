"use client"

import { createInputController, Input } from "@ui-sdk/react/input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import Form from "next/form"
import { useState } from "react"
import type { FormAction } from "@/lib/actions"
import { CepForm } from "../forms"

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

export { CepPopover, SearchForm }
