import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { getContent, type MenuCategory } from "@/lib/api"

const footerLinkClass = "text-fg-2 no-underline hover:text-fg hover:underline"

// Same menu tree as the category bar (cached content), so the footer lands in the static shell too.
async function Footer() {
  const [{ data }, t, nav] = await Promise.all([getContent<{ categories: MenuCategory[] }>("/categories"), getTranslations("Footer"), getTranslations("Nav")])
  return (
    <footer className="mt-12 border-t border-line px-4 pt-8 pb-6">
      <div className="mx-auto grid max-w-store grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="mb-3 text-xs tracking-[0.08em] text-fg-3 uppercase">
            {t("shop")}
          </h2>
          <ul className="m-0 grid list-none gap-1.5 p-0 text-base text-fg-2">
            {data.categories.map((category) => (
              <li key={category.id}>
                <Link href={`/c/${category.id}`} className={footerLinkClass}>
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/novidades" className={footerLinkClass}>
                {nav("news")}
              </Link>
            </li>
            <li>
              <Link href="/ofertas" className={footerLinkClass}>
                {nav("deals")}
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" className="mb-3 text-xs tracking-[0.08em] text-fg-3 uppercase">
            {t("account")}
          </h2>
          <ul className="m-0 grid list-none gap-1.5 p-0 text-base text-fg-2">
            <li>
              <Link href="/login" className={footerLinkClass}>
                {nav("signIn")}
              </Link>
            </li>
            <li>
              <Link href="/favorites" className={footerLinkClass}>
                {nav("favorites")}
              </Link>
            </li>
            <li>
              <Link href="/basket" className={footerLinkClass}>
                {nav("basket")}
              </Link>
            </li>
          </ul>
        </nav>
        <section aria-labelledby="footer-help">
          <h2 id="footer-help" className="mb-3 text-xs tracking-[0.08em] text-fg-3 uppercase">
            {t("help")}
          </h2>
          <ul className="m-0 grid list-none gap-1.5 p-0 text-base text-fg-2">
            <li>{t("freeShipping")}</li>
            <li>{t("returns")}</li>
            <li>{t("installments")}</li>
            <li>{t("cepPricing")}</li>
          </ul>
        </section>
      </div>
      <p className="mx-auto mt-8 flex max-w-store flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-4 font-mono text-xs text-fg-3">
        <span className="font-mono text-md tracking-[-0.03em] text-fg">playground</span> {t("legal")}
      </p>
    </footer>
  )
}

export { Footer }
