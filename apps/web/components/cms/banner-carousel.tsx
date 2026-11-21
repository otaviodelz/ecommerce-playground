"use client"

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
import Link from "next/link"
import type { BannerSlide } from "@/lib/api"

function BannerImage({ slide, hero }: { slide: BannerSlide; hero?: boolean }) {
  return (
    <Link href={slide.link} prefetch className="block">
      <img
        src={slide.image}
        alt={slide.alt}
        width={1200}
        height={400}
        className={cn("w-full border border-line", hero && "aspect-[4/3] object-cover")}
      />
    </Link>
  )
}

// Rotates on its own; the play toggle is required because the slides move without the user (WCAG 2.2.2).
function BannerCarousel({ slides, hero }: { slides: BannerSlide[]; hero?: boolean }) {
  const t = useTranslations("Carousel")
  if (slides.length === 1) return <BannerImage slide={slides[0]} hero={hero} />
  return (
    <Carousel aria-label={t("highlights")} loop defaultPlaying interval={6000}>
      <CarouselViewport className="col-span-full">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.image} aria-label={slide.alt}>
              <BannerImage slide={slide} hero={hero} />
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
