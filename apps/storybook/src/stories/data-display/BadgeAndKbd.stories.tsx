import type { Meta, StoryObj } from "@storybook/react-vite"
import { Badge, Kbd, Row, Separator, Skeleton, Spinner, Stack } from "@playground/design-system"

const meta: Meta<typeof Badge> = {
  title: "Data Display/Badge, Kbd & Loading",
  component: Badge,
  argTypes: {
    tone: {
      control: "select",
      options: ["default", "accent", "warning", "destructive"],
    },
    variant: {
      control: "select",
      options: ["outline", "solid"],
    },
  },
  args: {
    children: "-25%",
    tone: "accent",
    variant: "outline",
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Playground: Story = {}

export const AllTonesAndIndicators: Story = {
  render: () => (
    <Stack gap="md" className="max-w-lg">
      <Row>
        <Badge>Default</Badge>
        <Badge tone="accent">-25%</Badge>
        <Badge tone="warning">Últimas unidades</Badge>
        <Badge tone="destructive">Esgotado</Badge>
      </Row>
      <Row>
        <Badge variant="solid">Solid</Badge>
        <Badge tone="accent" variant="solid">
          Em estoque
        </Badge>
        <Badge tone="warning" variant="solid">
          Pré-venda
        </Badge>
        <Badge tone="destructive" variant="solid">
          Indisponível
        </Badge>
      </Row>
      <Separator />
      <Row gap="md">
        <Row gap="xs">
          <Kbd>/</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Enter</Kbd>
        </Row>
        <Row gap="sm">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Row>
      </Row>
      <Stack gap="xs">
        <Skeleton className="w-2/3" />
        <Skeleton className="w-1/3" />
      </Stack>
    </Stack>
  ),
}
