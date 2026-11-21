import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button, Row, Spinner, Stack } from "@playground/design-system"

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["outline", "solid", "accent", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    focusableWhenDisabled: { control: "boolean" },
  },
  args: {
    children: "Adicionar à cesta",
    variant: "solid",
    size: "md",
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {}

export const Variants: Story = {
  render: () => (
    <Row gap="md">
      <Button variant="solid">Solid</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </Row>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Row gap="md">
      <Button variant="solid" size="sm">
        Pequeno
      </Button>
      <Button variant="solid" size="md">
        Padrão
      </Button>
      <Button variant="solid" size="lg">
        Grande
      </Button>
    </Row>
  ),
}

export const AsyncPendingAndStates: Story = {
  render: () => (
    <Stack gap="md">
      <Row gap="md">
        <Button
          variant="solid"
          pendingAnnouncement="Salvando"
          onClick={() => new Promise((resolve) => setTimeout(resolve, 900))}
        >
          <Spinner data-show="pending" size="sm" />
          Salvar pedido
        </Button>
        <Button disabled focusableWhenDisabled>
          Indisponível (focável)
        </Button>
        <Button variant="ghost" render={<a href="#ofertas" />}>
          Link como botão ›
        </Button>
      </Row>
    </Stack>
  ),
}
