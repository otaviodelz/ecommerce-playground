"use client"

import { Button } from "@ui-sdk/react/button"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@ui-sdk/react/dialog"
import { useState, useTransition } from "react"
import { CepForm, type FormAction } from "../forms"

export type AddItem = (productId: string) => Promise<{ error?: string; locationRequired?: boolean }>

type Props = { productId: string; name: string; label: string; available: boolean; add?: AddItem; setLocation?: FormAction }

// Without `add` (offer still loading) the button holds its place, disabled.
function AddToBasket({ productId, name, label, available, add, setLocation }: Props) {
  const [askCep, setAskCep] = useState(false)
  const [error, setError] = useState("")
  const [added, setAdded] = useState(false)
  const [pending, startTransition] = useTransition()

  // Our own pending flag, not Button's onClick Promise, so the add that follows the CEP dialog shows it too.
  const submit = () =>
    startTransition(async () => {
      setAdded(false)
      const result = await add!(productId)
      setAskCep(!!result.locationRequired)
      setError(result.error ?? "")
      setAdded(!result.locationRequired && !result.error)
    })

  if (!available) {
    return (
      <Button disabled>
        Indisponível <span className="sr-only">{name}</span>
      </Button>
    )
  }

  return (
    <>
      <Button data-variant="solid" onClick={submit} disabled={!add || pending} aria-busy={pending || undefined} focusableWhenDisabled>
        {pending && <span className="spinner" aria-hidden="true" />}
        {label} <span className="sr-only">{name}</span>
      </Button>
      <p role="status" className="sr-only">
        {pending ? "Adicionando…" : added ? `${name} adicionado à cesta.` : ""}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {setLocation && (
        <Dialog open={askCep} onOpenChange={setAskCep}>
          <DialogBackdrop />
          <DialogContent className="stack">
            <DialogTitle>Informe seu CEP</DialogTitle>
            <DialogDescription>
              {name} não tem estoque em todas as regiões. Com o seu CEP conferimos o estoque e adicionamos à cesta.
            </DialogDescription>
            <CepForm
              action={setLocation}
              onSuccess={() => {
                setAskCep(false)
                submit()
              }}
            />
            <DialogClose>Cancelar</DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export { AddToBasket }
