import { getContent, type Block } from "@playground/platform/api"
import { ServerZoneLink } from "@playground/platform/zone-link"
import { Button } from "@playground/design-system/button"
import { Callout, CalloutBody, CalloutLabel } from "@playground/design-system/callout"
import { CellGrid, CellGridItem } from "@playground/design-system/cell-grid"
import { InfoBar } from "@playground/design-system/layout"
import { useTranslations } from "next-intl"
import { notFound } from "next/navigation"
import { BannerCarousel } from "./banner-carousel"
import { Cards } from "./cards"
import { Shelf } from "./shelf"
import { TabbedShelf } from "./tabbed-shelf"

function CmsBlock({ block }: { block: Block }) {
  const t = useTranslations("Nav")
  switch (block.type) {
    case "hero":
      return (
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <h1 className="text-display leading-[1.1]">{block.title}</h1>
            <p className="mt-3 max-w-[28rem] text-md text-fg-3">{block.text}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {block.actions.map((action, index) => (
                <Button key={action.link} render={<ServerZoneLink zone="discovery" href={action.link} prefetch />} variant={index === 0 ? "solid" : "outline"} size="lg">
                  {action.label}
                  {index > 0 && " ›"}
                </Button>
              ))}
            </div>
          </div>
          <BannerCarousel slides={block.slides} hero />
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
        <nav aria-label={t("shortcuts")}>
          <ul className="m-0 flex list-none flex-wrap gap-4 p-0">
            {block.items.map((item) => (
              <li key={item.link}>
                <ServerZoneLink zone="discovery" href={item.link} prefetch className="group grid w-[6.5rem] justify-items-center gap-1.5 text-center font-mono text-xs text-fg-2 no-underline">
                  <img src={item.icon} alt="" width={72} height={72} loading="lazy" decoding="async" className="border border-line group-hover:border-accent" />
                  {item.label}
                </ServerZoneLink>
              </li>
            ))}
          </ul>
        </nav>
      )
    case "callout":
      return (
        <Callout render={<p />}>
          <CalloutLabel>{block.label}</CalloutLabel>
          <CalloutBody>{block.link ? <ServerZoneLink zone="discovery" href={block.link} prefetch>{block.text}</ServerZoneLink> : block.text}</CalloutBody>
        </Callout>
      )
    case "info-bar":
      return <InfoBar>{block.link ? <ServerZoneLink zone="discovery" href={block.link} prefetch>{block.text}</ServerZoneLink> : block.text}</InfoBar>
    case "categories":
      return (
        <section>
          <h2 className="mb-3 flex items-baseline justify-between">{block.title}</h2>
          <CellGrid>
            {block.items.map((item) => (
              <CellGridItem key={item.link}>
                <ServerZoneLink zone="discovery" href={item.link} prefetch className="grid gap-0.5 no-underline">
                  <span className={item.link === "/ofertas" ? "text-accent" : undefined}>{item.label}</span>
                  <small className="font-mono text-xs text-fg-3">{item.description} ›</small>
                </ServerZoneLink>
              </CellGridItem>
            ))}
          </CellGrid>
        </section>
      )
    case "benefits":
      return (
        <CellGrid render={<ol />}>
          {block.items.map((item, index) => (
            <CellGridItem key={item.title}>
              <small className="font-mono text-xs text-fg-3">{String(index + 1).padStart(2, "0")}</small>
              <span>{item.title}</span>
              <small className="font-mono text-xs text-fg-3">{item.description}</small>
            </CellGridItem>
          ))}
        </CellGrid>
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
