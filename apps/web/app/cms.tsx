import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getContent, type Block, type ProductCard } from "@/lib/api"
import { BannerCarousel } from "./banner-carousel"
import { Price } from "./price"

function ProductTile({ product, ids }: { product: ProductCard; ids: string }) {
  return (
    <Link href={`/product/${product.id}`} className="tile">
      <img src={product.image} alt="" width={300} height={300} />
      <h3>{product.name}</h3>
      <p className="muted">{product.brand}</p>
      <Price id={product.id} ids={ids} />
    </Link>
  )
}

function Shelf({ block, ids }: { block: Extract<Block, { type: "shelf" }>; ids: string }) {
  return (
    <section>
      <h2>{block.title}</h2>
      <Carousel aria-label={block.title} slidesPerPage="auto" className="shelf">
        <CarouselPrevious aria-label={`Anteriores em ${block.title}`} />
        <CarouselViewport>
          <CarouselContent>
            {block.products.map((product) => (
              <CarouselItem key={product.id} aria-label={product.name}>
                <ProductTile product={product} ids={ids} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselNext aria-label={`Próximos em ${block.title}`} />
      </Carousel>
    </section>
  )
}

function CmsBlock({ block, ids }: { block: Block; ids: string }) {
  switch (block.type) {
    case "banner":
      return <BannerCarousel slides={block.slides} />
    case "shelf":
      return <Shelf block={block} ids={ids} />
    case "info-bar":
      return <p className="info-bar">{block.link ? <Link href={block.link}>{block.text}</Link> : block.text}</p>
    case "categories":
      return (
        <section>
          <h2>{block.title}</h2>
          <ul className="categories">
            {block.items.map((item) => (
              <li key={item.link}>
                <Link href={item.link}>
                  <img src={item.image} alt="" width={300} height={300} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )
    case "benefits":
      return (
        <ul className="benefits">
          {block.items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span className="muted">{item.description}</span>
            </li>
          ))}
        </ul>
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

export { CmsBlocks }
