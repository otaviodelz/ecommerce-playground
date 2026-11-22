"use client"

import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@playground/design-system/popover"
import type { FormAction } from "@playground/platform/forms"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { CepForm } from "./cep-form"

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

export { CepPopover }
