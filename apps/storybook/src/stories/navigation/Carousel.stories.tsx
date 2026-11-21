import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Card,
  CardBody,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  CarouselViewport,
} from "@playground/design-system"

const meta: Meta<typeof Carousel> = {
  title: "Navigation/Carousel",
  component: Carousel,
}

export default meta
type Story = StoryObj<typeof Carousel>

const slides = [
  { id: "01", title: "Coleção Corrida", desc: "Tênis e roupas leves para treinos diários." },
  { id: "02", title: "Eletrônicos GPS", desc: "Relógios e fones resistentes à água." },
  { id: "03", title: "Ofertas da Semana", desc: "Até 30% off em itens selecionados." },
]

export const BannerCarousel: Story = {
  render: () => (
    <Carousel aria-label="Destaques" loop interval={6000} className="max-w-2xl">
      <CarouselViewport className="col-span-full">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id} aria-label={slide.title}>
              <Card>
                <CardBody className="py-10">
                  <span className="font-mono text-xs text-accent">SLIDE {slide.id}</span>
                  <CardTitle className="text-xl">{slide.title}</CardTitle>
                  <p className="text-fg-2">{slide.desc}</p>
                </CardBody>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="col-span-full mt-3 flex items-center justify-end gap-4">
        <CarouselPlayToggle>{(state) => (state.playing ? "Pausar" : "Reproduzir")}</CarouselPlayToggle>
        <CarouselIndicatorGroup aria-label="Escolher destaque">
          {slides.map((slide, index) => (
            <CarouselIndicator key={slide.id} page={index + 1} aria-label={`Ir para: ${slide.title}`} />
          ))}
        </CarouselIndicatorGroup>
        <CarouselPrevious aria-label="Anterior" />
        <CarouselNext aria-label="Próximo" />
      </div>
    </Carousel>
  ),
}
