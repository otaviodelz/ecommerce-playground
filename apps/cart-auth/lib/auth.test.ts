import { getSession, resetSession } from "@playground/platform/client/session"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { signIn } from "./auth"

const jwt = (expInSeconds: number, tag: string) => `x.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expInSeconds }))}.${tag}`

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  resetSession()
  fetchMock = vi.fn(async () => Response.json({ accessToken: jwt(900, "guest"), name: null }))
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => vi.unstubAllGlobals())

test("a failed sign-in keeps the current session", async () => {
  const guest = await getSession()
  fetchMock.mockImplementationOnce(async () => Response.json({ error: "E-mail ou senha inválidos." }, { status: 401 }))
  const form = new FormData()
  form.set("email", "maria@example.com")
  form.set("password", "errada")
  expect(await signIn(form)).toEqual({ error: "E-mail ou senha inválidos." })
  expect(await getSession()).toBe(guest)
})

test("a successful sign-in replaces the in-memory session", async () => {
  await getSession()
  const signedToken = jwt(900, "maria")
  fetchMock.mockImplementationOnce(async () => Response.json({ accessToken: signedToken, name: "Maria" }))
  const form = new FormData()
  form.set("email", "maria@example.com")
  form.set("password", "123456")
  expect(await signIn(form)).toEqual({})
  expect(await getSession()).toEqual({ accessToken: signedToken, name: "Maria" })
})
