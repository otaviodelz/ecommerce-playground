"use client"

import { Button } from "@ui-sdk/react/button"
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@ui-sdk/react/password-input"
import { useState, useTransition, type FormEvent } from "react"
import type { FormAction } from "./actions"

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

function LoginForm({ action }: { action: FormAction }) {
  const { error, clear, onSubmit, pending } = useFormAction(action)
  return (
    <form onSubmit={onSubmit} className="stack">
      <Field name="email">
        <FieldLabel>E-mail</FieldLabel>
        <Input type="email" required autoComplete="username" onValueChange={clear} />
      </Field>
      <Field name="password" invalid={error ? true : undefined}>
        <FieldLabel>Senha</FieldLabel>
        <PasswordInput required onValueChange={clear}>
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Mostrar senha" />
        </PasswordInput>
        <FieldError />
        {error && <FieldError match>{error}</FieldError>}
      </Field>
      <Button type="submit" data-variant="solid" disabled={pending} focusableWhenDisabled>
        Entrar
      </Button>
    </form>
  )
}

function CepForm({ action, defaultCep, onSuccess }: { action: FormAction; defaultCep?: string; onSuccess?: () => void }) {
  const { error, clear, onSubmit, pending } = useFormAction(action, onSuccess)
  return (
    <form onSubmit={onSubmit} className="stack">
      <Field name="cep" invalid={error ? true : undefined}>
        <FieldLabel>CEP</FieldLabel>
        <Input defaultValue={defaultCep} required pattern="\d{5}-?\d{3}" placeholder="00000-000" inputMode="numeric" onValueChange={clear} />
        <FieldError />
        {error && <FieldError match>{error}</FieldError>}
      </Field>
      <Button type="submit" data-variant="solid" disabled={pending} focusableWhenDisabled>
        Salvar CEP
      </Button>
    </form>
  )
}

export { CepForm, LoginForm }
