import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import type { ProductCard as Card } from "@/lib/api"
import { ProductCard } from "../product/product-card"

// `heading={false}` inside a tab panel, where the tab already names the shelf.
function Shelf({ title, products, heading = true }: { title: string; products: Card[]; heading?: boolean }) {
  return (
    <Carousel aria-label={title} slidesPerPage="auto" className="shelf" render={<section />}>
      {heading && <h2>{title}</h2>}
      <CarouselPrevious aria-label={`Anteriores em ${title}`} />
      <CarouselNext aria-label={`Próximos em ${title}`} />
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

export { Shelf }
