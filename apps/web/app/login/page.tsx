import { login } from "../actions"
import { LoginForm } from "../forms"

export default function LoginPage() {
  return (
    <>
      <h1>Entrar</h1>
      <LoginForm action={login} />
    </>
  )
}
