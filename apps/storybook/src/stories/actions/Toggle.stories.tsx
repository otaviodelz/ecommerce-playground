import type { Meta, StoryObj } from "@storybook/react-vite"
import { Row, Toggle, ToggleGroup, ToggleIcon } from "@playground/design-system"

const meta: Meta<typeof Toggle> = {
  title: "Actions/Toggle",
  component: Toggle,
}

export default meta
type Story = StoryObj<typeof Toggle>

export const SingleAndIcon: Story = {
  render: () => (
    <Row gap="md">
      <Toggle defaultPressed>Somente em estoque</Toggle>
      <Toggle aria-label="Favoritar Tênis Runner">
        <ToggleIcon>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
        </ToggleIcon>
      </Toggle>
    </Row>
  ),
}

export const Group: Story = {
  render: () => (
    <ToggleGroup aria-label="Filtros de entrega" defaultValue={["frete-gratis"]}>
      <Toggle value="frete-gratis">Frete grátis</Toggle>
      <Toggle value="hoje">Chega hoje</Toggle>
      <Toggle value="retirada">Retira em loja</Toggle>
    </ToggleGroup>
  ),
}
