import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test, vi } from "vitest"
import { LoginForm } from "./login-form"

const agent = createAgent()

const named = () => agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more")

test("an agent can sign in through the login form", async () => {
  const action = vi.fn(async () => ({}))
  render(<LoginForm action={action} />)

  for (const entry of named()) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  const labels = named().map((entry) => entry.label)
  for (const label of ["E-mail", "Senha", "Entrar"]) expect(labels).toContain(label)

  const result = await agent.act({
    steps: [
      { ref: "E-mail", action: "setValue", args: ["maria@example.com"] },
      { ref: "Senha", action: "setValue", args: ["123456"] },
      { ref: "Entrar", action: "press" },
    ],
  })
  expect(result.ok, result.error?.message).toBe(true)
  await waitFor(() => expect(action).toHaveBeenCalledOnce())
  const form = (action.mock.calls[0] as unknown as [FormData])[0]
  expect([form.get("email"), form.get("password")]).toEqual(["maria@example.com", "123456"])
})

test("login shows the server error and clears it on edit", async () => {
  const user = userEvent.setup()
  render(<LoginForm action={async () => ({ error: "E-mail ou senha inválidos." })} />)

  await user.type(screen.getByLabelText("E-mail"), "maria@example.com")
  await user.type(screen.getByLabelText("Senha"), "errada")
  await user.click(screen.getByRole("button", { name: "Entrar" }))
  await waitFor(() => expect(screen.getByText("E-mail ou senha inválidos.").isConnected).toBe(true))
  // stays put and keeps what the person typed
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(screen.getByText("E-mail ou senha inválidos.")).toBeTruthy()
  expect(screen.getByLabelText<HTMLInputElement>("E-mail").value).toBe("maria@example.com")
  expect(screen.getByLabelText("Senha").getAttribute("aria-invalid")).toBe("true")

  await user.type(screen.getByLabelText("Senha"), "x")
  expect(screen.queryByText("E-mail ou senha inválidos.", { selector: '[data-slot="field-error"]' })).toBeNull()
  expect(screen.getByLabelText("Senha").getAttribute("aria-invalid")).toBeNull()
})

test("login with empty required fields does not call the action", async () => {
  const action = vi.fn(async () => ({}))
  render(<LoginForm action={action} />)
  await userEvent.setup().click(screen.getByRole("button", { name: "Entrar" }))
  expect(action).not.toHaveBeenCalled()
})
