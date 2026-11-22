import { applySession, requestSession } from "@playground/platform/client/session"

// Owned by apps/cart-auth (Squad: Login e Sacola).
// A failed sign-in leaves the current (guest) session untouched.
export async function signIn(form: FormData): Promise<{ error?: string }> {
  try {
    const session = await requestSession({ email: form.get("email"), password: form.get("password") })
    applySession(session)
    return {}
  } catch (error) {
    return { error: (error as Error).message }
  }
}
