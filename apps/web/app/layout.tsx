import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import "@ui-sdk/core/web.css"
import "./globals.css"
import { getContent, type MenuCategory } from "@/lib/api"
import { openGraphBase, SITE_URL } from "@/lib/config"
import { CategoryBar, CategoryLinks } from "@/components/layout/category-bar"
import { Footer } from "@/components/layout/footer"
import { SearchForm, Session } from "@/components/layout/header"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Playground Store", template: "%s | Playground Store" },
  description: "Ecommerce playground",
  openGraph: openGraphBase,
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
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
