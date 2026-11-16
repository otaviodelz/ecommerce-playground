import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import "@ui-sdk/core/web.css"
import "./globals.css"
import { getContent, type MenuCategory } from "@/lib/api"
import { CategoryBar, CategoryLinks } from "@/components/layout/category-bar"
import { SearchForm, Session } from "@/components/layout/header"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Playground Store",
  description: "Ecommerce playground",
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
        <Providers>
          <header className="header">
            <Link href="/" className="logo">
              playground
            </Link>
            <SearchForm />
            <Session />
          </header>
          <Categories />
          <main className="main">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
