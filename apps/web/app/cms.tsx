import { Button } from "@ui-sdk/react/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getContent, type Block, type ProductCard as Card } from "@/lib/api"
import { addItem } from "./actions"
import { BannerCarousel } from "./banner-carousel"
import { Price } from "./price"

function ProductCard({ product, ids }: { product: Card; ids: string }) {
  return (
    <article className="card">
      <Link href={`/product/${product.id}`}>
        <img src={product.image} alt="" width={300} height={300} />
        <div className="card-body">
          <h3>{product.name}</h3>
          <p className="muted">{product.brand}</p>
        </div>
      </Link>
      <div className="card-price">
        <Price id={product.id} ids={ids} />
      </div>
      <form action={addItem}>
        <input type="hidden" name="productId" value={product.id} />
        <Button type="submit" data-variant="solid">
          Adicionar<span className="sr-only"> {product.name}</span>
        </Button>
      </form>
    </article>
  )
}

function Shelf({ block, ids }: { block: Extract<Block, { type: "shelf" }>; ids: string }) {
  return (
    <Carousel aria-label={block.title} slidesPerPage="auto" className="shelf" render={<section />}>
      <h2>{block.title}</h2>
      <CarouselPrevious aria-label={`Anteriores em ${block.title}`} />
      <CarouselNext aria-label={`Próximos em ${block.title}`} />
      <CarouselViewport>
        <CarouselContent>
          {block.products.map((product) => (
            <CarouselItem key={product.id} aria-label={product.name}>
              <ProductCard product={product} ids={ids} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  )
}

function CmsBlock({ block, ids }: { block: Block; ids: string }) {
  switch (block.type) {
    case "hero":
      return (
        <section className="hero">
          <div>
            <h1>{block.title}</h1>
            <p>{block.text}</p>
            <div className="actions">
              {block.actions.map((action, index) => (
                <Link key={action.link} href={action.link} className={index === 0 ? "button primary" : "button"}>
                  {action.label}
                  {index > 0 && " ›"}
                </Link>
              ))}
            </div>
          </div>
          <BannerCarousel slides={block.slides} />
        </section>
      )
    case "banner":
      return <BannerCarousel slides={block.slides} />
    case "shelf":
      return <Shelf block={block} ids={ids} />
    case "info-bar":
      return <p className="info-bar">{block.link ? <Link href={block.link}>{block.text}</Link> : block.text}</p>
    case "categories":
      return (
        <section>
          <h2 className="section-title">{block.title}</h2>
          <ul className="cells">
            {block.items.map((item) => (
              <li key={item.link}>
                <Link href={item.link}>
                  <span className={item.link.endsWith("cid=ofertas") ? "deal" : undefined}>{item.label}</span>
                  <small>{item.description} ›</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )
    case "benefits":
      return (
        <ol className="cells">
          {block.items.map((item, index) => (
            <li key={item.title}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{item.title}</span>
              <small>{item.description}</small>
            </li>
          ))}
        </ol>
      )
    default:
      // A block type this storefront doesn't know yet (CMS ahead of the code) is skipped, not a crash.
      return null
  }
}

async function CmsBlocks({ cid }: { cid: string }) {
  const res = await getContent<{ blocks: Block[] }>(`/page?cid=${encodeURIComponent(cid)}`)
  if (res.status === 404) notFound()
  const { blocks } = res.data
  const ids = [...new Set(blocks.flatMap((b) => (b.type === "shelf" ? b.products.map((p) => p.id) : [])))].join(",")

  return blocks.map((block) => <CmsBlock key={block.id} block={block} ids={ids} />)
}

export { CmsBlocks, ProductCard }
