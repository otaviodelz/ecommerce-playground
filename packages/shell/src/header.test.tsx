import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { SearchForm } from "./header"

vi.mock("next/form", () => ({ default: (props: React.ComponentProps<"form">) => <form {...props} /> }))

test("pressing / focuses the search, and the search submits q to /search", async () => {
  const user = userEvent.setup()
  render(<SearchForm />)
  const search = screen.getByRole("searchbox", { name: "Buscar produtos" })
  await user.keyboard("/")
  expect(document.activeElement).toBe(search)
  expect(search.getAttribute("name")).toBe("q")
  expect(search.closest("form")?.getAttribute("action")).toBe("/search")
})
