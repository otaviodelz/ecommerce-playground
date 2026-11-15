import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import "@ui-sdk/core/web.css"
import "./globals.css"
import { api, getContent, getFavorites, type Basket, type MenuCategory } from "@/lib/api"
import { setLocation } from "@/lib/actions"
import { CategoryBar, CategoryLinks } from "@/components/layout/category-bar"
import { CepPopover, SearchForm } from "@/components/layout/header"

export const metadata: Metadata = {
  title: "Playground Store",
  description: "Ecommerce playground",
}

async function Session() {
  const jar = await cookies()
  const name = jar.get("name")?.value
  const [basket, favorites] = await Promise.all([api<Basket>("/basket"), getFavorites()])
  const count = basket.ok ? basket.data.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  const favoriteCount = favorites.ok ? favorites.data.products.length : 0
  return (
    <div className="session">
      <CepPopover action={setLocation} cep={jar.get("cep")?.value} />
      {name ? <span>olá, {name.split(" ")[0].toLowerCase()}</span> : <Link href="/login">entrar</Link>}
      <Link href="/favorites" aria-label={`Favoritos, ${favoriteCount} ${favoriteCount === 1 ? "produto" : "produtos"}`}>
        favoritos <span className="count">[{favoriteCount}]</span>
      </Link>
      <Link href="/basket" aria-label={`Cesta, ${count} ${count === 1 ? "item" : "itens"}`}>
        cesta <span className="count">[{count}]</span>
      </Link>
    </div>
  )
}

// The menu tree is the same for everyone: cached content, so the bar lands in the static shell.
async function Categories() {
  const { data } = await getContent<{ categories: MenuCategory[] }>("/categories")
  return (
    <Suspense fallback={<CategoryLinks categories={data.categories} />}>
      <CategoryBar categories={data.categories} />
    </Suspense>
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
        <Categories />
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
