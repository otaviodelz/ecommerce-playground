import type { Meta, StoryObj } from "@storybook/react-vite"
import { Stack, Tabs, TabsList, TabsPanel, TabsTab } from "@playground/design-system"

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  argTypes: {
    variant: {
      control: "select",
      options: ["terminal", "line"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

export const TerminalAndLine: Story = {
  render: () => (
    <Stack gap="xl" className="max-w-xl">
      <Tabs variant="terminal" defaultValue="corrida">
        <TabsList aria-label="Categorias da vitrine">
          <TabsTab value="corrida">Corrida</TabsTab>
          <TabsTab value="acessorios">Acessórios</TabsTab>
          <TabsTab value="eletronicos">Eletrônicos</TabsTab>
        </TabsList>
        <TabsPanel value="corrida">Produtos selecionados de corrida.</TabsPanel>
        <TabsPanel value="acessorios">Mochilas, garrafas e acessórios técnicos.</TabsPanel>
        <TabsPanel value="eletronicos">Relógios GPS e fones esportivos.</TabsPanel>
      </Tabs>

      <Tabs variant="line" defaultValue="specs">
        <TabsList aria-label="Seções do produto">
          <TabsTab value="specs">Especificações</TabsTab>
          <TabsTab value="envio">Envio</TabsTab>
          <TabsTab value="trocas">Trocas</TabsTab>
        </TabsList>
        <TabsPanel value="specs">Ficha técnica detalhada do produto.</TabsPanel>
        <TabsPanel value="envio">Postagem em até 24 horas úteis.</TabsPanel>
        <TabsPanel value="trocas">Troca grátis em até 30 dias após o recebimento.</TabsPanel>
      </Tabs>
    </Stack>
  ),
}
