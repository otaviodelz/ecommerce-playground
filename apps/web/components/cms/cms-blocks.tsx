import Link from "next/link"
import { notFound } from "next/navigation"
import { getContent, type Block } from "@/lib/api"
import { BannerCarousel } from "./banner-carousel"
import { Cards } from "./cards"
import { Shelf } from "./shelf"
import { TabbedShelf } from "./tabbed-shelf"

function CmsBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return (
        <section className="hero">
          <div>
            <h1>{block.title}</h1>
            <p>{block.text}</p>
            <div className="actions">
              {block.actions.map((action, index) => (
                <Link key={action.link} href={action.link} prefetch className={index === 0 ? "button primary" : "button"}>
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
      return <Shelf title={block.title} products={block.products} />
    case "tabbed-shelf":
      return <TabbedShelf block={block} />
    case "cards":
      return <Cards title={block.title} items={block.items} />
    case "shortcuts":
      return (
        <nav aria-label="Atalhos">
          <ul className="shortcuts">
            {block.items.map((item) => (
              <li key={item.link}>
                <Link href={item.link} prefetch>
                  <img src={item.icon} alt="" width={72} height={72} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )
    case "callout":
      return (
        <p className="callout">
          <strong>{block.label}</strong>
          <span>{block.link ? <Link href={block.link} prefetch>{block.text}</Link> : block.text}</span>
        </p>
      )
    case "info-bar":
      return <p className="info-bar">{block.link ? <Link href={block.link} prefetch>{block.text}</Link> : block.text}</p>
    case "categories":
      return (
        <section>
          <h2 className="section-title">{block.title}</h2>
          <ul className="cells">
            {block.items.map((item) => (
              <li key={item.link}>
                <Link href={item.link} prefetch>
                  <span className={item.link === "/ofertas" ? "deal" : undefined}>{item.label}</span>
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
  return res.data.blocks.map((block) => <CmsBlock key={block.id} block={block} />)
}

export { CmsBlocks }
