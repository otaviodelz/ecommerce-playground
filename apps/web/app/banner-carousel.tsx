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
} from "@ui-sdk/react/carousel"
import Link from "next/link"
import type { BannerSlide } from "@/lib/api"

function BannerImage({ slide }: { slide: BannerSlide }) {
  return (
    <Link href={slide.link} className="banner">
      <img src={slide.image} alt={slide.alt} width={1200} height={400} />
    </Link>
  )
}

// Rotates on its own; the play toggle is required because the slides move without the user (WCAG 2.2.2).
function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  if (slides.length === 1) return <BannerImage slide={slides[0]} />
  return (
    <Carousel aria-label="Destaques" className="banner-carousel" loop defaultPlaying interval={6000}>
      <CarouselViewport>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.image} aria-label={slide.alt}>
              <BannerImage slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="carousel-controls">
        <CarouselPlayToggle>{(state) => (state.playing ? "Pausar destaques" : "Reproduzir destaques")}</CarouselPlayToggle>
        <CarouselIndicatorGroup aria-label="Escolher destaque">
          {slides.map((slide, index) => (
            <CarouselIndicator key={slide.image} page={index + 1} aria-label={`Ir para: ${slide.alt}`} />
          ))}
        </CarouselIndicatorGroup>
        <CarouselPrevious aria-label="Destaque anterior" />
        <CarouselNext aria-label="Próximo destaque" />
      </div>
    </Carousel>
  )
}

export { BannerCarousel }
