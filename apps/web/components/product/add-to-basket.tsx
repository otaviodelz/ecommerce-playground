"use client"

import { Button } from "@playground/design-system/button"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@playground/design-system/dialog"
import { Spinner } from "@playground/design-system/spinner"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { CepForm, type FormAction } from "../forms"

export type AddItem = (productId: string) => Promise<{ error?: string; locationRequired?: boolean }>

type Props = { productId: string; name: string; label: string; available: boolean; add?: AddItem; setLocation?: FormAction }

// Without `add` (offer still loading) the button holds its place, disabled.
function AddToBasket({ productId, name, label, available, add, setLocation }: Props) {
  const t = useTranslations("Offer")
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
        {t("unavailable")} <span className="sr-only">{name}</span>
      </Button>
    )
  }

  return (
    <>
      <Button variant="solid" onClick={submit} disabled={!add || pending} aria-busy={pending || undefined} focusableWhenDisabled>
        {pending && <Spinner className="spinner me-2" />}
        {label} <span className="sr-only">{name}</span>
      </Button>
      <p role="status" className="sr-only">
        {pending ? t("adding") : added ? t("added", { name }) : ""}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {setLocation && (
        <Dialog open={askCep} onOpenChange={setAskCep}>
          <DialogBackdrop />
          <DialogContent className="flex max-w-[26rem] flex-col gap-4">
            <DialogTitle>{t("askCepTitle")}</DialogTitle>
            <DialogDescription>{t("askCepDescription", { name })}</DialogDescription>
            <CepForm
              action={setLocation}
              onSuccess={() => {
                setAskCep(false)
                submit()
              }}
            />
            <DialogClose>{t("cancel")}</DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export { AddToBasket }
