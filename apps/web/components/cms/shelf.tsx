import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@ui-sdk/react/carousel"
import type { Block } from "@/lib/api"
import { ProductCard } from "../product/product-card"

function Shelf({ block, ids }: { block: Extract<Block, { type: "shelf" }>; ids: string }) {
  return (
    <Carousel aria-label={block.title} slidesPerPage="auto" className="shelf" render={<section />}>
      <h2>{block.title}</h2>
      <CarouselPrevious aria-label={`Anteriores em ${block.title}`} />
      <CarouselNext aria-label={`Próximos em ${block.title}`} />
      <CarouselViewport>
        <CarouselContent>
          {block.products.map((product) => (
            <CarouselItem key={product.id} aria-label={product.name}>
              <ProductCard product={product} ids={ids} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
    </Carousel>
  )
}

export { Shelf }
