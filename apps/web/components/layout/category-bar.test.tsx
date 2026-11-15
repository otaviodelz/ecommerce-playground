import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test } from "vitest"
import { CategoryLinks } from "./category-bar"

const menu = [
  { id: "corrida", name: "Corrida", subcategories: [{ id: "tenis", name: "Tênis" }, { id: "meias", name: "Meias" }] },
  { id: "eletronicos", name: "Eletrônicos", subcategories: [{ id: "fones", name: "Fones" }] },
]

test("a category opens its subcategories and the current page is marked", async () => {
  const user = userEvent.setup()
  render(<CategoryLinks categories={menu} current="/c/tenis" />)
  expect(screen.getByRole("link", { name: "Início" }).getAttribute("aria-current")).toBeNull()
  expect(screen.getByRole("link", { name: "Ofertas" }).getAttribute("href")).toBe("/ofertas")

  const corrida = screen.getByRole("button", { name: "Corrida" })
  expect(corrida.hasAttribute("data-active")).toBe(true) // the open page is one of its subcategories
  expect(screen.getByRole("button", { name: "Eletrônicos" }).hasAttribute("data-active")).toBe(false)

  await user.click(corrida)
  expect(corrida.getAttribute("aria-expanded")).toBe("true")
  expect(screen.getByRole("link", { name: "Tudo em Corrida" }).getAttribute("href")).toBe("/c/corrida")
  const tenis = screen.getByRole("link", { name: "Tênis" })
  expect([tenis.getAttribute("href"), tenis.getAttribute("aria-current")]).toEqual(["/c/tenis", "page"])
  expect(screen.getByRole("link", { name: "Meias" }).getAttribute("aria-current")).toBeNull()
})

test("hovering a category opens its panel", async () => {
  const user = userEvent.setup()
  render(<CategoryLinks categories={menu} />)
  const eletronicos = screen.getByRole("button", { name: "Eletrônicos" })
  await user.hover(eletronicos)
  await waitFor(() => expect(eletronicos.getAttribute("aria-expanded")).toBe("true"))
  expect(screen.getByRole("link", { name: "Fones" }).getAttribute("href")).toBe("/c/fones")
})
