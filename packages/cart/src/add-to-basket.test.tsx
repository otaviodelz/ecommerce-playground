import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { AddToBasket } from "./add-to-basket"

const props = { productId: "relogio-gps", name: "Relógio GPS", label: "Adicionar" }

test("out of stock shows a disabled Indisponível button", () => {
  render(<AddToBasket {...props} available={false} add={vi.fn()} />)
  const button = screen.getByRole<HTMLButtonElement>("button", { name: "Indisponível Relógio GPS" })
  expect(button.disabled).toBe(true)
})

test("in stock adds the product", async () => {
  const add = vi.fn(async () => ({}))
  render(<AddToBasket {...props} available add={add} />)
  await userEvent.setup().click(screen.getByRole("button", { name: "Adicionar Relógio GPS" }))
  expect(add).toHaveBeenCalledWith("relogio-gps")
  expect(screen.queryByRole("dialog")).toBeNull()
})

test("shows a spinner and stays busy until the add finishes, then confirms", async () => {
  let finish = () => {}
  const add = vi.fn(() => new Promise<{}>((resolve) => (finish = () => resolve({}))))
  render(<AddToBasket {...props} available add={add} />)
  const button = screen.getByRole("button", { name: "Adicionar Relógio GPS" })

  await userEvent.setup().click(button)
  await waitFor(() => expect(button.getAttribute("aria-busy")).toBe("true"))
  expect(button.querySelector(".spinner")).not.toBeNull()
  expect(screen.getByRole("status").textContent).toBe("Adicionando…")

  finish()
  await waitFor(() => expect(button.hasAttribute("aria-busy")).toBe(false))
  expect(button.querySelector(".spinner")).toBeNull()
  expect(screen.getByRole("status").textContent).toBe("Relógio GPS adicionado à cesta.")
})

test("without a CEP and not in stock everywhere, asks for the CEP and then adds", async () => {
  const user = userEvent.setup()
  let hasCep = false
  const add = vi.fn(async () => (hasCep ? {} : { locationRequired: true }))
  const setLocation = vi.fn(async () => ((hasCep = true), {}))
  render(<AddToBasket {...props} available add={add} setLocation={setLocation} />)

  await user.click(screen.getByRole("button", { name: "Adicionar Relógio GPS" }))
  const dialog = await screen.findByRole("dialog", { name: "Informe seu CEP" })
  await user.type(screen.getByLabelText("CEP"), "01310-100")
  await user.click(screen.getByRole("button", { name: "Salvar CEP" }))

  await waitFor(() => expect(add).toHaveBeenCalledTimes(2))
  expect((setLocation.mock.calls[0] as unknown as [FormData])[0].get("cep")).toBe("01310-100")
  await waitFor(() => expect(dialog.hasAttribute("open")).toBe(false))
})

test("out of stock for the visitor's CEP shows the error", async () => {
  render(<AddToBasket {...props} available add={async () => ({ error: "Sem estoque para o seu CEP." })} />)
  await userEvent.setup().click(screen.getByRole("button", { name: "Adicionar Relógio GPS" }))
  expect((await screen.findByRole("alert")).textContent).toBe("Sem estoque para o seu CEP.")
})
