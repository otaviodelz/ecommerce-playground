import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getContent, getDefaultOffer, type Offer as OfferInfo, type Product } from "@/lib/api"
import { openGraphBase, SITE_URL } from "@/lib/config"
import { Offer } from "@/components/product/offer"

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
        priceCurrency: "BRL",
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
  const [res, offer] = await Promise.all([getProduct(id), getDefaultOffer(id)])
  if (res.status === 404) notFound()
  const product = res.data

  return (
    <article className="product">
      <ProductJsonLd product={product} offer={offer} />
      {/* Open Graph product tags for link previews; React hoists these into <head>. */}
      <meta property="og:type" content="product" />
      {offer && (
        <>
          <meta property="product:price:amount" content={amount(offer.price)} />
          <meta property="product:price:currency" content="BRL" />
          <meta property="product:availability" content={offer.available ? "in stock" : "out of stock"} />
        </>
      )}
      <img src={product.images[0]} alt={product.name} width={600} height={600} />
      <div className="stack">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href={`/c/${product.category.id}`} prefetch>{product.category.name}</Link> ›{" "}
          <Link href={`/c/${product.subcategory.id}`} prefetch>{product.subcategory.name}</Link> › {product.brand}
        </nav>
        <h1>{product.name}</h1>
        {/* Always on screen at the top of the page, so it skips the viewport wait. */}
        <Offer product={product} label="Adicionar à cesta" className="offer" eager />
        <p className="muted">{product.description}</p>
        <dl className="specs">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key}>
              <dt className="muted">{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
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
  return (
    <article className="product" aria-busy="true">
      <p className="sr-only" role="status">
        Carregando produto
      </p>
      <span className="skeleton product-skeleton-image" />
      <div className="stack" aria-hidden="true">
        <span className="skeleton" style={{ width: "14rem", height: "0.75rem" }} />
        <span className="skeleton" style={{ width: "75%", height: "2.1rem" }} />
        <div className="offer">
          <span className="skeleton" style={{ width: "8rem", height: "2.6rem", marginTop: "0.4rem" }} />
          <span className="skeleton" style={{ width: "10rem", height: "2.25rem" }} />
        </div>
        <div className="skeleton-lines">
          <span className="skeleton" style={{ width: "100%" }} />
          <span className="skeleton" style={{ width: "85%" }} />
        </div>
        <dl className="specs">
          {[0, 1, 2].map((row) => (
            <div key={row}>
              <span className="skeleton" style={{ width: "5rem" }} />
              <span className="skeleton" style={{ width: "7rem" }} />
            </div>
          ))}
        </dl>
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
