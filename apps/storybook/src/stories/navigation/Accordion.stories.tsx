import type { Meta, StoryObj } from "@storybook/react-vite"
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@playground/design-system"

const meta: Meta<typeof Accordion> = {
  title: "Navigation/Accordion",
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

export const FAQ: Story = {
  render: () => (
    <Accordion aria-label="Perguntas frequentes" defaultValue={["entrega"]} className="max-w-xl">
      <AccordionItem value="entrega">
        <AccordionHeader>
          <AccordionTrigger>Como o CEP afeta preço e estoque?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Cada região é atendida por um depósito específico. Ao informar seu CEP, preços e disponibilidade são atualizados em tempo real.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="trocas">
        <AccordionHeader>
          <AccordionTrigger>Qual é o prazo para troca ou devolução?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Você tem até 30 dias corridos após o recebimento para solicitar troca gratuita.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="pagamento">
        <AccordionHeader>
          <AccordionTrigger>Quais formas de pagamento são aceitas?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Cartão de crédito em até 10x sem juros e PIX com confirmação imediata.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
}
