import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@playground/design-system/carousel"
import { cn } from "@playground/design-system/cn"
import { useTranslations } from "next-intl"
import type { ProductCard as Card } from "@/lib/api"
import { ProductCard } from "../product/product-card"

const shelfFrameClass =
  "grid-cols-[minmax(0,1fr)_auto_auto] gap-x-1 gap-y-3 [&>h2]:col-start-1 [&>h2]:row-start-1 [&>[data-slot=carousel-previous]]:col-start-2 [&>[data-slot=carousel-previous]]:row-start-1 [&>[data-slot=carousel-next]]:col-start-3 [&>[data-slot=carousel-next]]:row-start-1 [&>[data-slot=carousel-viewport]]:col-span-full [&>[data-slot=carousel-viewport]]:row-start-2 [&_[data-slot=carousel-content]]:gap-3 [&:has([data-slot=carousel-previous][data-disabled]):has([data-slot=carousel-next][data-disabled])_[data-slot=carousel-previous]]:invisible [&:has([data-slot=carousel-previous][data-disabled]):has([data-slot=carousel-next][data-disabled])_[data-slot=carousel-next]]:invisible"

// `heading={false}` inside a tab panel, where the tab already names the shelf.
function Shelf({ title, products, heading = true, compact = false }: { title: string; products: Card[]; heading?: boolean; compact?: boolean }) {
  const t = useTranslations("Carousel")
  return (
    <Carousel
      aria-label={title}
      slidesPerPage="auto"
      className={cn(
        shelfFrameClass,
        "[&_[data-slot=carousel-item]]:shrink-0 [&_[data-slot=carousel-item]]:grow-0 [&_[data-slot=carousel-item]]:basis-[calc((100%-0.75rem)/2)]",
        compact
          ? "md:[&_[data-slot=carousel-item]]:basis-[calc((100%-2*0.75rem)/3)]"
          : "md:[&_[data-slot=carousel-item]]:basis-[calc((100%-3*0.75rem)/4)]",
      )}
      render={<section />}
    >
      {heading && <h2>{title}</h2>}
      <CarouselPrevious aria-label={t("previousIn", { title })} />
      <CarouselNext aria-label={t("nextIn", { title })} />
      <CarouselViewport>
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} aria-label={product.name}>
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  )
}

export { Shelf, shelfFrameClass }
