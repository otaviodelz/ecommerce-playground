import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test, vi } from "vitest"
import { CepForm } from "./cep-form"
import { CepPopover } from "./cep-popover"

const agent = createAgent()

test("cep form submits the cep and shows an invalid cep error", async () => {
  const user = userEvent.setup()
  const action = vi.fn(async (form: FormData) => (form.get("cep") === "01310-100" ? {} : { error: "CEP inválido. Use 00000-000." }))
  render(<CepForm action={action} defaultCep="01310-100" />)

  await user.click(screen.getByRole("button", { name: "Salvar CEP" }))
  await waitFor(() => expect(action).toHaveBeenCalledOnce())
  expect(screen.queryByText("CEP inválido. Use 00000-000.")).toBeNull()

  await user.clear(screen.getByLabelText("CEP"))
  await user.type(screen.getByLabelText("CEP"), "99999-999")
  await user.click(screen.getByRole("button", { name: "Salvar CEP" }))
  await waitFor(() => expect(action).toHaveBeenCalledTimes(2))
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(screen.getByText("CEP inválido. Use 00000-000.")).toBeTruthy()
  expect(screen.getByLabelText<HTMLInputElement>("CEP").value).toBe("99999-999")
})

test("an agent can set the CEP through the popover, which closes after saving", async () => {
  const user = userEvent.setup()
  const action = vi.fn(async () => ({}))
  render(<CepPopover action={action} cep="01310-100" />)

  await user.click(screen.getByRole("button", { name: "CEP de entrega: 01310-100" }))
  expect(await screen.findByRole("dialog", { name: "Onde entregar?" })).toBeTruthy()

  const result = await agent.act({
    steps: [
      { ref: "CEP", action: "setValue", args: ["22041-001"] },
      { ref: "Salvar CEP", action: "press" },
    ],
  })
  expect(result.ok, result.error?.message).toBe(true)
  await waitFor(() => expect(action).toHaveBeenCalledOnce())
  expect((action.mock.calls[0] as unknown as [FormData])[0].get("cep")).toBe("22041-001")
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Onde entregar?" })).toBeNull())
})
