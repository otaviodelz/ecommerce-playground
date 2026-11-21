import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Row,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@playground/design-system"

const meta: Meta = {
  title: "Overlays/Popover, Menu & Tooltip",
}

export default meta
type Story = StoryObj

export const FloatingLayers: Story = {
  render: () => (
    <Row gap="md">
      <Popover>
        <PopoverTrigger>Depósito ativo</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Depósito br-01</PopoverTitle>
          <PopoverDescription className="text-fg-3">
            Os preços exibidos seguem o depósito padrão até você informar um CEP.
          </PopoverDescription>
        </PopoverContent>
      </Popover>

      <Menu>
        <MenuTrigger>Ações do pedido</MenuTrigger>
        <MenuContent>
          <MenuItem value="detalhes">Ver detalhes</MenuItem>
          <MenuItem value="duplicar">Comprar novamente</MenuItem>
          <MenuSeparator />
          <MenuItem value="cancelar">Cancelar pedido</MenuItem>
        </MenuContent>
      </Menu>

      <Tooltip>
        <TooltipTrigger>Ajuda CEP</TooltipTrigger>
        <TooltipContent>Calcula prazo e estoque por região</TooltipContent>
      </Tooltip>
    </Row>
  ),
}
