import { NextResponse, type NextRequest } from "next/server"
import { API_URL, cookieOptions } from "@/lib/config"

// Reads exp without verifying: the API verifies; this only decides when to refresh (30s early).
function expired(jwt: string | undefined) {
  try {
    const payload = JSON.parse(atob(jwt!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return payload.exp * 1000 < Date.now() + 30_000
  } catch {
    return true
  }
}

const post = (path: string, body: unknown) =>
  fetch(API_URL + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .catch(() => null)

// Every visitor gets a session: refresh it when the access token is near expiry, else start a guest one.
export async function proxy(request: NextRequest) {
  if (!expired(request.cookies.get("at")?.value)) return NextResponse.next()

  const refreshToken = request.cookies.get("rt")?.value
  let res = expired(refreshToken) ? null : await post("/refresh-token", { refreshToken })
  const guest = !res?.ok
  if (guest) res = await post("/guest-login", {})
  if (!res?.ok) return NextResponse.next()

  const tokens: { accessToken: string; refreshToken: string } = await res.json()
  request.cookies.set("at", tokens.accessToken)
  request.cookies.set("rt", tokens.refreshToken)
  if (guest) request.cookies.delete("name")

  const response = NextResponse.next({ request: { headers: request.headers } })
  response.cookies.set("at", tokens.accessToken, cookieOptions)
  response.cookies.set("rt", tokens.refreshToken, cookieOptions)
  if (guest) response.cookies.delete("name")
  return response
}

export const config = { matcher: ["/((?!_next/static|_next/image|images/|favicon.ico).*)"] }
