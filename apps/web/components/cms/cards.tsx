import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import Link from "next/link"
import type { PromoCard } from "@/lib/api"

// A row of promo or editorial cards, framed like a shelf: title and arrows on top, four cards per view.
function Cards({ title, items }: { title: string; items: PromoCard[] }) {
  return (
    <Carousel aria-label={title} slidesPerPage="auto" className="shelf cards" render={<section />}>
      <h2>{title}</h2>
      <CarouselPrevious aria-label={`Anteriores em ${title}`} />
      <CarouselNext aria-label={`Próximos em ${title}`} />
      <CarouselViewport>
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem key={item.link + item.title} aria-label={item.title}>
              <Link href={item.link} prefetch className="promo-card">
                <img src={item.image} alt="" width={480} height={640} />
                <span className="promo-card-body">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                  <span className="promo-card-cta" aria-hidden="true">
                    {item.label} ›
                  </span>
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  )
}

export { Cards }
