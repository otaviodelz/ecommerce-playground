import { Offer } from "@playground/catalog/offer"
import type { Offer as OfferInfo } from "@playground/catalog/pricing"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@playground/design-system/breadcrumb"
import { DataList, DataListDetail, DataListItem, DataListTerm } from "@playground/design-system/data-list"
import { Skeleton } from "@playground/design-system/skeleton"
import { getContent, type Product } from "@playground/platform/api"
import { market, openGraphBase, SITE_URL } from "@playground/platform/config"
import { ServerZoneLink } from "@playground/platform/zone-link"
import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getDefaultOffer } from "@/lib/pricing"

const getProduct = (id: string) => getContent<Product>(`/product?id=${encodeURIComponent(id)}`)

const amount = (cents: number) => (cents / 100).toFixed(2)

// Structured data for rich results and Shopping, with the no-CEP offer: the same price a visitor without a CEP sees.
function ProductJsonLd({ product, offer }: { product: Product; offer: OfferInfo | null }) {
  const url = `${SITE_URL}/product/${product.id}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    sku: product.id,
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: `${product.category.name} > ${product.subcategory.name}`,
    image: product.images.map((image) => new URL(image, SITE_URL).href),
    url,
    ...(offer && {
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: market.currency,
        price: amount(offer.price),
        availability: `https://schema.org/${offer.available ? "InStock" : "OutOfStock"}`,
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
  }
  // "<" escaped so text from the catalog can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
}

async function ProductDetail({ params }: Pick<PageProps<"/product/[id]">, "params">) {
  const { id } = await params
  const [res, offer, t, offerT] = await Promise.all([getProduct(id), getDefaultOffer(id), getTranslations("Common"), getTranslations("Offer")])
  if (res.status === 404) notFound()
  const product = res.data

  return (
    <article className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-8">
      <ProductJsonLd product={product} offer={offer} />
      {/* Open Graph product tags for link previews; React hoists these into <head>. */}
      <meta property="og:type" content="product" />
      {offer && (
        <>
          <meta property="product:price:amount" content={amount(offer.price)} />
          <meta property="product:price:currency" content={market.currency} />
          <meta property="product:availability" content={offer.available ? "in stock" : "out of stock"} />
        </>
      )}
      <img src={product.images[0]} alt={product.name} width={600} height={600} fetchPriority="high" decoding="async" className="aspect-square w-full border border-line object-cover" />
      <div className="flex max-w-[26rem] flex-col gap-4">
        <Breadcrumb aria-label={t("youAreHere")}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <ServerZoneLink zone="pdp" href={`/c/${product.category.id}`}>{product.category.name}</ServerZoneLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <ServerZoneLink zone="pdp" href={`/c/${product.subcategory.id}`}>{product.subcategory.name}</ServerZoneLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>{product.brand}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1>{product.name}</h1>
        {/* Always on screen at the top of the page, so it skips the viewport wait. */}
        <Offer product={product} label={offerT("addToBasket")} className="grid justify-items-start gap-3" eager />
        <p className="text-fg-3">{product.description}</p>
        <DataList>
          {Object.entries(product.specs).map(([key, value]) => (
            <DataListItem key={key}>
              <DataListTerm>{key}</DataListTerm>
              <DataListDetail>{value}</DataListDetail>
            </DataListItem>
          ))}
        </DataList>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params
  const res = await getProduct(id)
  if (res.status === 404) return {} // the page itself answers with notFound()
  const { name, brand, description, images } = res.data
  const path = `/product/${id}`
  return {
    title: `${name} ${brand}`,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, title: name, description, url: path, images: images.map((url) => ({ url, alt: name })) },
  }
}

// ISR with Cache Components: one real product is built (Cache Components requires at least one, and rendering a real
// page lets the build check the route); any other product gets the fallback on its first visit, then is rendered in the
// background and served complete from then on. params stays awaited inside the Suspense so that fallback shell exists.
export async function generateStaticParams() {
  return [{ id: "tenis-runner" }]
}

// Same layout as ProductDetail (image, breadcrumb, title, offer, description, specs), so nothing jumps when it arrives.
function ProductSkeleton() {
  const t = useTranslations("Product")
  return (
    <article className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-8" aria-busy="true">
      <p className="sr-only" role="status">
        {t("loading")}
      </p>
      <Skeleton className="aspect-square h-auto w-full border border-line" />
      <div className="flex max-w-[26rem] flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-3 w-56" />
        <Skeleton className="h-[2.1rem] w-3/4" />
        <div className="grid justify-items-start gap-3">
          <Skeleton className="mt-1.5 h-[2.6rem] w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="w-full" />
          <Skeleton className="w-[85%]" />
        </div>
        <DataList>
          {[0, 1, 2].map((row) => (
            <DataListItem key={row}>
              <Skeleton className="w-20" />
              <Skeleton className="w-28" />
            </DataListItem>
          ))}
        </DataList>
      </div>
    </article>
  )
}

export default function ProductPage({ params }: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail params={params} />
    </Suspense>
  )
}
