import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { FavoriteToggle } from "./favorite-toggle"

const heart = () => screen.getByRole("button", { name: "Favoritar Tênis Runner" })

test("pressing the heart fills it at once and saves the new state", async () => {
  let finish = () => {}
  const action = vi.fn(() => new Promise<{}>((resolve) => (finish = () => resolve({}))))
  render(<FavoriteToggle productId="tenis-runner" name="Tênis Runner" favorited={false} action={action} />)

  expect(heart().getAttribute("aria-pressed")).toBe("false")
  await userEvent.setup().click(heart())
  expect(action).toHaveBeenCalledWith("tenis-runner", true)
  expect(heart().getAttribute("aria-pressed")).toBe("true") // before the server answers
  finish()
})

test("a failed save falls back to the server's state", async () => {
  const action = vi.fn(async () => ({ error: "Não foi possível atualizar os favoritos." }))
  render(<FavoriteToggle productId="tenis-runner" name="Tênis Runner" favorited action={action} />)

  await userEvent.setup().click(heart())
  expect(action).toHaveBeenCalledWith("tenis-runner", false)
  await waitFor(() => expect(heart().getAttribute("aria-pressed")).toBe("true"))
})

test("without an action (still loading) the heart can't be pressed", () => {
  render(<FavoriteToggle productId="tenis-runner" name="Tênis Runner" favorited={false} />)
  expect((heart() as HTMLButtonElement).disabled).toBe(true)
})
