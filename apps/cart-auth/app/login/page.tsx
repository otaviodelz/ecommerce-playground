import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { SignIn } from "@/components/login-form"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  const t = useTranslations("Nav")
  return (
    <>
      <h1>{t("signIn")}</h1>
      <SignIn />
    </>
  )
}
