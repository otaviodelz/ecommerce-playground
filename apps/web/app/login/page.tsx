import { useTranslations } from "next-intl"
import { SignIn } from "@/components/forms"

export default function LoginPage() {
  const t = useTranslations("Nav")
  return (
    <>
      <h1>{t("signIn")}</h1>
      <SignIn />
    </>
  )
}
