"use client"

import { Button } from "@playground/design-system/button"
import { Field, FieldError, FieldLabel } from "@playground/design-system/field"
import { Input } from "@playground/design-system/input"
import { useFormAction, type FormAction } from "@playground/platform/forms"
import { useTranslations } from "next-intl"

function CepForm({ action, defaultCep, onSuccess }: { action: FormAction; defaultCep?: string; onSuccess?: () => void }) {
  const t = useTranslations("Forms")
  const { error, clear, onSubmit, pending } = useFormAction(action, onSuccess)
  return (
    <form onSubmit={onSubmit} className="flex max-w-[26rem] flex-col gap-4">
      <Field name="cep" invalid={error ? true : undefined}>
        <FieldLabel>{t("cep")}</FieldLabel>
        <Input mono defaultValue={defaultCep} required pattern="\d{5}-?\d{3}" placeholder="00000-000" inputMode="numeric" onValueChange={clear} />
        <FieldError />
        {error && <FieldError match>{error}</FieldError>}
      </Field>
      <Button type="submit" variant="solid" disabled={pending} focusableWhenDisabled>
        {t("saveCep")}
      </Button>
    </form>
  )
}

export { CepForm }
