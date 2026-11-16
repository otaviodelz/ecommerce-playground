import { expiresSoon, tokenExpiry } from "../token"

export type Session = { accessToken: string; name: string | null }

// The access token lives only in this module's memory; /api/session trades the httpOnly refresh token for a new one.
let current: { session: Promise<Session>; expiresAt: number } | undefined

async function requestSession(credentials?: { email: FormDataEntryValue | null; password: FormDataEntryValue | null }) {
  const res = await fetch("/api/session", {
    method: "POST",
    ...(credentials && { headers: { "content-type": "application/json" }, body: JSON.stringify(credentials) }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? "Não foi possível iniciar a sessão.")
  return data as Session
}

function track(session: Promise<Session>) {
  const entry = { session, expiresAt: Infinity } // Infinity while in flight, so concurrent calls share one request
  current = entry
  session.then(
    (s) => (entry.expiresAt = tokenExpiry(s.accessToken)),
    () => current === entry && (current = undefined),
  )
  return session
}

export function getSession(renew = false) {
  if (renew || !current || expiresSoon(current.expiresAt)) return track(requestSession())
  return current.session
}

// A failed sign-in leaves the current (guest) session as it was.
export async function signIn(form: FormData): Promise<{ error?: string }> {
  try {
    const session = await requestSession({ email: form.get("email"), password: form.get("password") })
    track(Promise.resolve(session))
    return {}
  } catch (error) {
    return { error: (error as Error).message }
  }
}

// Tests only: forget the in-memory session.
export const resetSession = () => (current = undefined)
