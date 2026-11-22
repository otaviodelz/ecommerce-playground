import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test } from "vitest"
import { BannerCarousel } from "./banner-carousel"

const agent = createAgent()
const slides = [
  { image: "/images/a.svg", link: "/product/a", alt: "Slide A" },
  { image: "/images/b.svg", link: "/product/b", alt: "Slide B" },
  { image: "/images/c.svg", link: "/product/c", alt: "Slide C" },
]

test("an agent can find the banner carousel and stop its rotation", async () => {
  render(<BannerCarousel slides={slides} />)
  const carousel = agent.snapshot().find((entry) => entry.label === "Destaques")
  expect(carousel?.component).toBe("carousel")
  expect(carousel?.playing).toBe(true)

  const result = await agent.act({ steps: [{ ref: "Destaques", action: "pause" }] })
  expect(result.ok, result.error?.message).toBe(true)
  expect(await screen.findByRole("button", { name: "Reproduzir destaques" })).toBeTruthy()
})

test("banner slides, controls and indicators are named in Portuguese", async () => {
  render(<BannerCarousel slides={slides} />)
  expect(screen.getByRole("region", { name: "Destaques" })).toBeTruthy()
  for (const slide of slides) {
    expect(screen.getByRole("group", { name: slide.alt })).toBeTruthy()
    expect(screen.getByRole("tab", { name: `Ir para: ${slide.alt}` })).toBeTruthy()
    expect(screen.getByRole("img", { name: slide.alt }).closest("a")?.getAttribute("href")).toBe(slide.link)
  }
  expect(screen.getByRole("button", { name: "Destaque anterior" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Próximo destaque" })).toBeTruthy()

  await userEvent.setup().click(screen.getByRole("button", { name: "Pausar destaques" }))
  await waitFor(() => expect(screen.getByRole("button", { name: "Reproduzir destaques" })).toBeTruthy())
})

test("a single-slide banner is a plain link, not a carousel", () => {
  render(<BannerCarousel slides={[slides[0]]} />)
  expect(screen.queryByRole("region", { name: "Destaques" })).toBeNull()
  expect(screen.getByRole("img", { name: "Slide A" }).closest("a")?.getAttribute("href")).toBe("/product/a")
})
