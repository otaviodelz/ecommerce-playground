import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test, vi } from "vitest"
import { CepPopover, SearchForm } from "./header"

vi.mock("next/form", () => ({ default: (props: React.ComponentProps<"form">) => <form {...props} /> }))

const agent = createAgent()

test("pressing / focuses the search, and the search submits q to /search", async () => {
  const user = userEvent.setup()
  render(<SearchForm />)
  const search = screen.getByRole("searchbox", { name: "Buscar produtos" })
  await user.keyboard("/")
  expect(document.activeElement).toBe(search)
  expect(search.getAttribute("name")).toBe("q")
  expect(search.closest("form")?.getAttribute("action")).toBe("/search")
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
