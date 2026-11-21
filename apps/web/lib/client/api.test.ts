import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { clientApi } from "./api"
import { getSession, resetSession, signIn } from "./session"

// A JWT whose payload only carries exp (seconds), enough for tokenExpiry.
const jwt = (expInSeconds: number, tag: string) => `x.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expInSeconds }))}.${tag}`

let tokens: string[]
let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  resetSession()
  tokens = [jwt(900, "first"), jwt(900, "second")]
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/session") return Response.json({ accessToken: tokens.shift(), name: null })
    const auth = new Headers(init?.headers).get("authorization")
    // The API accepts only the second token, as if the first had been revoked.
    return auth?.endsWith(".second") ? Response.json({ ok: true, warehouse: new Headers(init?.headers).get("warehouse") }) : Response.json({ error: "unauthorized" }, { status: 401 })
  })
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

test("sends the in-memory token and warehouse, renewing the session once on a 401", async () => {
  const res = await clientApi<{ warehouse: string }>("/prices?ids=a", { warehouse: "sp-01" })
  expect(res).toMatchObject({ ok: true, status: 200, data: { warehouse: "sp-01" } })
  const calls = fetchMock.mock.calls.map(([url]) => url)
  expect(calls).toEqual(["/api/session", "http://localhost:3333/prices?ids=a", "/api/session", "http://localhost:3333/prices?ids=a"])
})

test("concurrent calls share one session request, and a fresh token is reused", async () => {
  tokens = [jwt(900, "second")]
  await Promise.all([clientApi("/a"), clientApi("/b"), clientApi("/c")])
  await clientApi("/d")
  expect(fetchMock.mock.calls.filter(([url]) => url === "/api/session")).toHaveLength(1)
})

test("a token about to expire is renewed before the request leaves", async () => {
  tokens = [jwt(10, "first"), jwt(900, "second")]
  await getSession()
  const res = await clientApi("/a")
  expect(res.ok).toBe(true)
  expect(fetchMock.mock.calls.filter(([url]) => url === "/api/session")).toHaveLength(2)
})

test("a network failure comes back as status 0 instead of throwing", async () => {
  fetchMock.mockImplementation(async () => {
    throw new TypeError("Failed to fetch")
  })
  expect(await clientApi("/a")).toMatchObject({ ok: false, status: 0 })
})

test("a failed sign-in keeps the current session", async () => {
  tokens = [jwt(900, "second")]
  const guest = await getSession()
  fetchMock.mockImplementationOnce(async () => Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 }))
  const form = new FormData()
  form.set("email", "maria@example.com")
  form.set("password", "errada")
  expect(await signIn(form)).toEqual({ error: "E-mail ou senha inválidos." })
  expect(await getSession()).toBe(guest)
})
