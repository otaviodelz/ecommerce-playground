import type { Meta, StoryObj } from "@storybook/react-vite"
import { Callout, CalloutBody, CalloutLabel, InfoBar, Stack } from "@playground/design-system"

const meta: Meta<typeof Callout> = {
  title: "Data Display/Callout & InfoBar",
  component: Callout,
  argTypes: {
    tone: {
      control: "select",
      options: ["accent", "neutral", "warning", "destructive"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Callout>

export const Tones: Story = {
  render: () => (
    <Stack gap="md" className="max-w-2xl">
      <InfoBar>Frete grátis acima de R$ 199 · Preço e estoque calculados pelo seu CEP</InfoBar>
      <Callout tone="accent">
        <CalloutLabel>Oferta</CalloutLabel>
        <CalloutBody>Use o cupom TERMINAL10 para 10% off na primeira compra.</CalloutBody>
      </Callout>
      <Callout tone="neutral">
        <CalloutLabel>Info</CalloutLabel>
        <CalloutBody>Os preços exibidos correspondem ao depósito padrão br-01.</CalloutBody>
      </Callout>
      <Callout tone="warning">
        <CalloutLabel>Estoque</CalloutLabel>
        <CalloutBody>Restam apenas 3 unidades disponíveis para entrega expressa.</CalloutBody>
      </Callout>
      <Callout tone="destructive">
        <CalloutLabel>Indisponível</CalloutLabel>
        <CalloutBody>Este item está sem estoque para o CEP informado.</CalloutBody>
      </Callout>
    </Stack>
  ),
}
