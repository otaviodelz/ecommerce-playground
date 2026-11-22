import type { Block } from "@playground/platform/api"
import { ServerZoneLink } from "@playground/platform/zone-link"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@playground/design-system/tabs"
import { Shelf } from "./shelf"

// A banner beside a shelf whose tabs switch the product list. Hidden tabs unmount, so their prices load only when picked.
function TabbedShelf({ block }: { block: Extract<Block, { type: "tabbed-shelf" }> }) {
  return (
    <section className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]" aria-labelledby={`${block.id}-title`}>
      <h2 id={`${block.id}-title`} className="col-span-full">
        {block.title}
      </h2>
      <ServerZoneLink zone="discovery" href={block.banner.link} prefetch className="block">
        <img
          src={block.banner.image}
          alt={block.banner.alt}
          width={600}
          height={1200}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full border border-line object-cover md:aspect-auto md:h-full"
        />
      </ServerZoneLink>
      <Tabs variant="terminal" defaultValue={block.tabs[0]?.label}>
        <TabsList aria-label={block.title}>
          {block.tabs.map((tab) => (
            <TabsTab key={tab.label} value={tab.label}>
              {tab.label}
            </TabsTab>
          ))}
        </TabsList>
        {block.tabs.map((tab) => (
          <TabsPanel key={tab.label} value={tab.label}>
            <Shelf title={tab.label} products={tab.products} heading={false} compact />
          </TabsPanel>
        ))}
      </Tabs>
    </section>
  )
}

export { TabbedShelf }
