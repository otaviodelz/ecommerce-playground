import { getContent, type MenuCategory } from "@playground/platform/api"
import { market, openGraphBase, SITE_URL } from "@playground/platform/config"
import { Providers } from "@playground/platform/providers"
import { ServerZoneLink } from "@playground/platform/zone-link"
import { getCrossZoneSpeculationRules, type ZoneId } from "@playground/platform/zones"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import { CategoryBar, CategoryLinks } from "./category-bar"
import { Footer } from "./footer"
import { SearchForm, Session } from "./header"

export async function createStorefrontMetadata(): Promise<Metadata> {
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

export function StorefrontLayout({ zone, children }: { zone: ZoneId; children: React.ReactNode }) {
  const speculationRules = JSON.stringify(getCrossZoneSpeculationRules(zone))

  return (
    <html lang={market.locale}>
      <body>
        {/* Declarative hover/pointerdown speculation rules warm cross-zone documents without eager prefetch storms. */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculationRules }} />
        {/* Rendered on the server, so it hands the market's locale and messages to client components. */}
        <NextIntlClientProvider>
          <Providers zone={zone}>
            <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-4 py-3">
              <ServerZoneLink zone={zone} href="/" className="font-mono text-md tracking-[-0.03em] no-underline">
                playground
              </ServerZoneLink>
              <SearchForm />
              <Session />
            </header>
            <Categories />
            <main className="mx-auto flex w-full max-w-store flex-col gap-8 px-4 pt-6 pb-12">{children}</main>
            <Footer zone={zone} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
