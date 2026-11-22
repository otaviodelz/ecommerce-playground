import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import { ServerZoneLink } from "./zone-link"
import { ZoneForm, ZoneLink, ZoneProvider } from "./zone-navigation"

vi.mock("next/link", () => ({
  default: ({ href, prefetch, ...props }: React.ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a data-next-link="true" data-prefetch={prefetch ? "true" : undefined} href={href} {...props} />
  ),
}))

vi.mock("next/form", () => ({
  default: ({ action, ...props }: React.ComponentProps<"form">) => <form data-next-form="true" action={action} {...props} />,
}))

test("ZoneLink uses Next Link intra-zone and native anchor cross-zone without leaking prefetch", () => {
  render(
    <ZoneProvider zone="discovery">
      <ZoneLink href="/c/corrida" prefetch>
        Corrida
      </ZoneLink>
      <ZoneLink href="/product/tenis-runner" prefetch>
        Tênis
      </ZoneLink>
      <ZoneLink href="/basket">Cesta</ZoneLink>
    </ZoneProvider>,
  )

  const category = screen.getByRole("link", { name: "Corrida" })
  expect(category.getAttribute("data-next-link")).toBe("true")
  expect(category.getAttribute("data-prefetch")).toBe("true")

  const pdp = screen.getByRole("link", { name: "Tênis" })
  expect(pdp.getAttribute("data-next-link")).toBeNull()
  expect(pdp.hasAttribute("prefetch")).toBe(false)
  expect(pdp.getAttribute("href")).toBe("/product/tenis-runner")

  const basket = screen.getByRole("link", { name: "Cesta" })
  expect(basket.getAttribute("data-next-link")).toBeNull()
})

test("ZoneForm uses next/form inside discovery and native GET form from other zones", () => {
  const { rerender } = render(
    <ZoneProvider zone="discovery">
      <ZoneForm action="/search" aria-label="Busca">
        <input name="q" />
      </ZoneForm>
    </ZoneProvider>,
  )
  expect(screen.getByRole("form", { name: "Busca" }).getAttribute("data-next-form")).toBe("true")

  rerender(
    <ZoneProvider zone="pdp">
      <ZoneForm action="/search" aria-label="Busca">
        <input name="q" />
      </ZoneForm>
    </ZoneProvider>,
  )
  const form = screen.getByRole("form", { name: "Busca" })
  expect(form.getAttribute("data-next-form")).toBeNull()
  expect(form.getAttribute("method")).toBe("get")
  expect(form.getAttribute("action")).toBe("/search")
})

test("ServerZoneLink resolves intra-zone and cross-zone links without React context", () => {
  render(
    <>
      <ServerZoneLink zone="discovery" href="/c/corrida" prefetch>
        Categoria
      </ServerZoneLink>
      <ServerZoneLink zone="discovery" href="/product/tenis-runner" prefetch>
        Produto
      </ServerZoneLink>
      <ServerZoneLink zone="pdp" href="/c/corrida" prefetch>
        Voltar categoria
      </ServerZoneLink>
    </>,
  )

  expect(screen.getByRole("link", { name: "Categoria" }).getAttribute("data-next-link")).toBe("true")
  const product = screen.getByRole("link", { name: "Produto" })
  expect(product.getAttribute("data-next-link")).toBeNull()
  expect(product.hasAttribute("prefetch")).toBe(false)
  expect(screen.getByRole("link", { name: "Voltar categoria" }).getAttribute("data-next-link")).toBeNull()
})
