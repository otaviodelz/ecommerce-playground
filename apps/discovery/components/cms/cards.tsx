import type { PromoCard } from "@playground/platform/api"
import { ServerZoneLink } from "@playground/platform/zone-link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@playground/design-system/carousel"
import { cn } from "@playground/design-system/cn"
import { useTranslations } from "next-intl"
import { shelfFrameClass } from "./shelf"

// A row of promo or editorial cards, framed like a shelf: title and arrows on top, four cards per view.
function Cards({ title, items }: { title: string; items: PromoCard[] }) {
  const t = useTranslations("Carousel")
  return (
    <Carousel
      aria-label={title}
      slidesPerPage="auto"
      className={cn(
        shelfFrameClass,
        "[&_[data-slot=carousel-item]]:shrink-0 [&_[data-slot=carousel-item]]:grow-0 [&_[data-slot=carousel-item]]:basis-[calc((100%-0.75rem)/2)] md:[&_[data-slot=carousel-item]]:basis-[calc((100%-3*0.75rem)/4)]",
      )}
      render={<section />}
    >
      <h2>{title}</h2>
      <CarouselPrevious aria-label={t("previousIn", { title })} />
      <CarouselNext aria-label={t("nextIn", { title })} />
      <CarouselViewport>
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.link + item.title} aria-label={item.title}>
              <ServerZoneLink zone="discovery" href={item.link} prefetch className="flex h-full flex-col border border-line bg-surface no-underline hover:bg-surface-2">
                <img src={item.image} alt="" width={480} height={640} loading="lazy" decoding="async" className="aspect-[3/4] w-full border-b border-line object-cover" />
                <span className="grid gap-1 p-3">
                  <strong>{item.title}</strong>
                  <span className="text-[0.85rem] text-fg-3">{item.text}</span>
                  <span className="mt-1 font-mono text-xs text-accent" aria-hidden="true">
                    {item.label} ›
                  </span>
                </span>
              </ServerZoneLink>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  )
}

export { Cards }
