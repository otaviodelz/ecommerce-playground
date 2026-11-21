import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Suspense } from "react"
import "./globals.css"
import { getContent, type MenuCategory } from "@/lib/api"
import { market, openGraphBase, SITE_URL } from "@/lib/config"
import { CategoryBar, CategoryLinks } from "@/components/layout/category-bar"
import { Footer } from "@/components/layout/footer"
import { SearchForm, Session } from "@/components/layout/header"
import { Providers } from "@/components/providers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Playground Store", template: "%s | Playground Store" },
    description: t("description"),
    openGraph: openGraphBase,
  }
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
    <html lang={market.locale}>
      <body>
        {/* Rendered on the server, so it hands the market's locale and messages to client components. */}
        <NextIntlClientProvider>
          <Providers>
            <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-4 py-3">
              <Link href="/" className="font-mono text-md tracking-[-0.03em] no-underline">
                playground
              </Link>
              <SearchForm />
              <Session />
            </header>
            <Categories />
            <main className="mx-auto flex w-full max-w-store flex-col gap-8 px-4 pt-6 pb-12">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
