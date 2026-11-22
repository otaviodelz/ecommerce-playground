"use client"

import { Button } from "@playground/design-system/button"
import { Field, FieldError, FieldLabel } from "@playground/design-system/field"
import { Input } from "@playground/design-system/input"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@playground/design-system/password-input"
import { useFormAction, type FormAction } from "@playground/platform/forms"
import { useZoneNavigate } from "@playground/platform/zone-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { signIn } from "@/lib/auth"

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

// Signing in swaps the in-memory token, clears persisted store cache and navigates back to the storefront home zone.
function SignIn() {
  const navigate = useZoneNavigate()
  const queryClient = useQueryClient()
  return (
    <LoginForm
      action={signIn}
      onSuccess={() => {
        queryClient.invalidateQueries()
        navigate("/")
      }}
    />
  )
}

export { LoginForm, SignIn }
