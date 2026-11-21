import { cookies } from "next/headers"
import { API_URL, cookieOptions } from "@/lib/config"

type Tokens = { accessToken: string; refreshToken: string; name?: string; error?: string }

const post = (path: string, body: unknown) =>
  fetch(API_URL + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then(async (res) => ({ ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as Tokens }))
    .catch(() => null)

// Hands the browser an access token to keep in memory; the refresh token never leaves its httpOnly cookie.
// With { email, password } it signs in; otherwise it refreshes the session, or starts a guest one.
export async function POST(request: Request) {
  const jar = await cookies()
  const credentials = await request.json().catch(() => null)

  if (credentials) {
    const res = await post("/login", { email: credentials.email, password: credentials.password })
    if (!res?.ok) {
      const error = res?.status === 401 ? "E-mail ou senha inválidos." : (res?.data.error ?? "Erro ao entrar.")
      return Response.json({ error }, { status: res?.status ?? 502 })
    }
    jar.set("rt", res.data.refreshToken, cookieOptions)
    jar.set("name", res.data.name!, cookieOptions)
    return Response.json({ accessToken: res.data.accessToken, name: res.data.name })
  }

  const refreshToken = jar.get("rt")?.value
  const name = jar.get("name")?.value ?? null
  const refreshed = refreshToken ? await post("/refresh-token", { refreshToken }) : null
  const res = refreshed?.ok ? refreshed : await post("/guest-login", {})
  if (!res?.ok) return Response.json({ error: "Não foi possível iniciar a sessão." }, { status: 502 })

  jar.set("rt", res.data.refreshToken, cookieOptions)
  if (res !== refreshed) jar.delete("name")
  return Response.json({ accessToken: res.data.accessToken, name: res === refreshed ? name : null })
}
