"use client"

import { Button } from "@playground/design-system/button"
import { Field, FieldError, FieldLabel } from "@playground/design-system/field"
import { Input } from "@playground/design-system/input"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@playground/design-system/password-input"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useTransition, type FormEvent } from "react"
import { signIn } from "@/lib/client/session"

export type FormAction = (form: FormData) => Promise<{ error?: string }>

// onSubmit instead of <form action>: React resets the form after an action, wiping the typed values and the error.
function useFormAction(action: FormAction, onSuccess?: () => void) {
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await action(form)
      setError(result.error ?? "")
      if (!result.error) onSuccess?.()
    })
  }
  return { error, clear: () => setError(""), onSubmit, pending }
}

function LoginForm({ action, onSuccess }: { action: FormAction; onSuccess?: () => void }) {
  const t = useTranslations("Forms")
  const { error, clear, onSubmit, pending } = useFormAction(action, onSuccess)
  return (
    <form onSubmit={onSubmit} className="flex max-w-[26rem] flex-col gap-4">
      <Field name="email">
        <FieldLabel>{t("email")}</FieldLabel>
        <Input type="email" required autoComplete="username" onValueChange={clear} />
      </Field>
      <Field name="password" invalid={error ? true : undefined}>
        <FieldLabel>{t("password")}</FieldLabel>
        <PasswordInput required onValueChange={clear}>
          <PasswordInputControl />
          <PasswordInputToggle aria-label={t("showPassword")} />
        </PasswordInput>
        <FieldError />
        {error && <FieldError match>{error}</FieldError>}
      </Field>
      <Button type="submit" variant="solid" disabled={pending} focusableWhenDisabled>
        {t("signIn")}
      </Button>
    </form>
  )
}

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

// Signing in swaps the in-memory token, so every cached query (basket, favorites, name) refetches as the new customer.
function SignIn() {
  const router = useRouter()
  const queryClient = useQueryClient()
  return (
    <LoginForm
      action={signIn}
      onSuccess={() => {
        queryClient.invalidateQueries()
        router.push("/")
      }}
    />
  )
}

export { CepForm, LoginForm, SignIn }
