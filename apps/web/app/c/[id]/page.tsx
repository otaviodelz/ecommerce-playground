import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@playground/design-system/breadcrumb"
import { PageHeader } from "@playground/design-system/layout"
import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, type Category, type MenuCategory } from "@/lib/api"
import { openGraphBase } from "@/lib/config"
import { ProductCard } from "@/components/product/product-card"

async function CategoryListing({ params }: Pick<PageProps<"/c/[id]">, "params">) {
  const { id } = await params
  const [res, t, common] = await Promise.all([getContent<Category>(`/category?id=${encodeURIComponent(id)}`), getTranslations("Category"), getTranslations("Common")])
  if (res.status === 404) notFound()
  const { name, description, parent, products } = res.data

  return (
    <>
      <PageHeader>
        {parent && (
          <Breadcrumb aria-label={common("youAreHere")}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href={`/c/${parent.id}`} prefetch>
                  {parent.name}
                </Link>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem aria-current="page">{name}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1>{name}</h1>
        <p className="text-fg-3">{description}</p>
        <p className="font-mono text-fg-3">{t("count", { count: products.length })}</p>
      </PageHeader>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3 p-0">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  )
}

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const { id } = await params
  const [res, t] = await Promise.all([getContent<Category>(`/category?id=${encodeURIComponent(id)}`), getTranslations("Category")])
  if (res.status === 404) return {} // the page itself answers with notFound()
  const { name, description, parent } = res.data
  const path = `/c/${id}`
  return {
    title: parent ? t("title", { name, parent: parent.name }) : name,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, title: name, description, url: path },
  }
}

// Every category and subcategory is built (there are few); one added later works like an unlisted product:
// fallback on its first visit, then served complete. See app/product/[id]/page.tsx.
export async function generateStaticParams() {
  const { data } = await getContent<{ categories: MenuCategory[] }>("/categories")
  return data.categories.flatMap((c) => [c, ...c.subcategories]).map(({ id }) => ({ id }))
}

export default function CategoryPage({ params }: PageProps<"/c/[id]">) {
  const t = useTranslations("Common")
  return (
    <Suspense fallback={<p className="text-fg-3">{t("loading")}</p>}>
      <CategoryListing params={params} />
    </Suspense>
  )
}
