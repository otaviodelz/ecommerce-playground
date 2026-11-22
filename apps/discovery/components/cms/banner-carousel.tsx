"use client"

import type { BannerSlide } from "@playground/platform/api"
import { ZoneLink } from "@playground/platform/zone-navigation"
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from "@playground/design-system/carousel"
import { cn } from "@playground/design-system/cn"
import { useTranslations } from "next-intl"

function BannerImage({ slide, hero, priority = false }: { slide: BannerSlide; hero?: boolean; priority?: boolean }) {
  return (
    <ZoneLink href={slide.link} prefetch className="block">
      <img
        src={slide.image}
        alt={slide.alt}
        width={1200}
        height={400}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("w-full border border-line", hero && "aspect-[4/3] object-cover")}
      />
    </ZoneLink>
  )
}

// Rotates on its own; the play toggle is required because the slides move without the user (WCAG 2.2.2).
// Only the first slide of a hero banner is eager/high-priority so off-screen slides don't compete with LCP.
function BannerCarousel({ slides, hero }: { slides: BannerSlide[]; hero?: boolean }) {
  const t = useTranslations("Carousel")
  if (slides.length === 1) return <BannerImage slide={slides[0]} hero={hero} priority={Boolean(hero)} />
  return (
    <Carousel aria-label={t("highlights")} loop defaultPlaying interval={6000}>
      <CarouselViewport className="col-span-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.image} aria-label={slide.alt}>
              <BannerImage slide={slide} hero={hero} priority={Boolean(hero && index === 0)} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="col-span-full flex items-center justify-end gap-4">
        <CarouselPlayToggle className="h-auto border-0 bg-transparent p-0 font-mono text-xs text-fg-3 hover:bg-transparent hover:text-fg">
          {(state) => (state.playing ? t("pause") : t("play"))}
        </CarouselPlayToggle>
        <CarouselIndicatorGroup aria-label={t("pick")}>
          {slides.map((slide, index) => (
            <CarouselIndicator key={slide.image} page={index + 1} aria-label={t("goTo", { name: slide.alt })} />
          ))}
        </CarouselIndicatorGroup>
        <CarouselPrevious aria-label={t("previous")} />
        <CarouselNext aria-label={t("next")} />
      </div>
    </Carousel>
  )
}

export { BannerCarousel }
