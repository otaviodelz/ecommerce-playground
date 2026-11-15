import { login } from "@/lib/actions"
import { LoginForm } from "@/components/forms"

export default function LoginPage() {
  return (
    <>
      <h1>Entrar</h1>
      <LoginForm action={login} />
    </>
  )
}
