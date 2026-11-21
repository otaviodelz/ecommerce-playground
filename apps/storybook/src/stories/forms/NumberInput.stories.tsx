import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Field,
  FieldDescription,
  FieldLabel,
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@playground/design-system"

const meta: Meta<typeof NumberInput> = {
  title: "Forms/NumberInput",
  component: NumberInput,
}

export default meta
type Story = StoryObj<typeof NumberInput>

export const QuantityStepper: Story = {
  render: () => (
    <Field className="max-w-xs">
      <FieldLabel>Quantidade</FieldLabel>
      <NumberInput defaultValue={1} min={1} max={99}>
        <NumberInputGroup>
          <NumberInputDecrement aria-label="Diminuir quantidade" />
          <NumberInputControl />
          <NumberInputIncrement aria-label="Aumentar quantidade" />
        </NumberInputGroup>
      </NumberInput>
      <FieldDescription>Limite de 99 unidades por produto na cesta.</FieldDescription>
    </Field>
  ),
}
