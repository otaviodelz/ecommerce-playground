import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Field,
  FieldLabel,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@playground/design-system"

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
}

export default meta
type Story = StoryObj<typeof Select>

export const CatalogSort: Story = {
  render: () => (
    <Field className="max-w-xs">
      <FieldLabel>Ordenar catálogo</FieldLabel>
      <Select defaultValue="relevancia">
        <SelectTrigger>
          <SelectValue placeholder="Escolha uma ordem" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Destaques</SelectGroupLabel>
            <SelectItem value="relevancia">
              Relevância
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="novidades">
              Mais recentes
              <SelectItemIndicator />
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Preço</SelectGroupLabel>
            <SelectItem value="menor-preco">
              Menor preço
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="maior-desconto">
              Maior desconto
              <SelectItemIndicator />
            </SelectItem>
            <SelectItem value="avaliacao" disabled>
              Melhor avaliados (em breve)
              <SelectItemIndicator />
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  ),
}
