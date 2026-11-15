import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import "@ui-sdk/core/web.css"
import "./globals.css"
import { api, type Basket } from "@/lib/api"
import { setLocation } from "./actions"
import { CategoryBar, CategoryLinks, CepPopover, SearchForm } from "./header"

export const metadata: Metadata = {
  title: "Playground Store",
  description: "Ecommerce playground",
}

async function Session() {
  const jar = await cookies()
  const name = jar.get("name")?.value
  const basket = await api<Basket>("/basket")
  const count = basket.ok ? basket.data.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  return (
    <div className="session">
      <CepPopover action={setLocation} cep={jar.get("cep")?.value} />
      {name ? <span>olá, {name.split(" ")[0].toLowerCase()}</span> : <Link href="/login">entrar</Link>}
      <Link href="/basket" aria-label={`Cesta, ${count} ${count === 1 ? "item" : "itens"}`}>
        cesta <span className="count">[{count}]</span>
      </Link>
    </div>
  )
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <Link href="/" className="logo">
            playground
          </Link>
          <SearchForm />
          <Suspense fallback={<div className="session" />}>
            <Session />
          </Suspense>
        </header>
        <Suspense fallback={<CategoryLinks />}>
          <CategoryBar />
        </Suspense>
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
