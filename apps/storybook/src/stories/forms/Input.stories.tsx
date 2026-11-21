import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputClear,
  InputGroup,
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
  Stack,
  Textarea,
} from "@playground/design-system"

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
}

export default meta
type Story = StoryObj<typeof Input>

export const TextFields: Story = {
  render: () => (
    <Stack gap="md" className="max-w-md">
      <Field name="cep">
        <FieldLabel>CEP de entrega</FieldLabel>
        <Input mono defaultValue="01310-100" placeholder="00000-000" inputMode="numeric" />
        <FieldDescription>Preço e estoque variam por depósito regional.</FieldDescription>
      </Field>

      <Field name="cupom">
        <FieldLabel>Cupom promocional</FieldLabel>
        <InputGroup aria-label="Grupo de código promocional">
          <Input mono defaultValue="TERMINAL10" placeholder="Digite o código" />
          <InputClear aria-label="Limpar cupom" />
        </InputGroup>
      </Field>

      <Field name="senha">
        <FieldLabel>Senha</FieldLabel>
        <PasswordInput defaultValue="segredo123">
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Mostrar senha" />
        </PasswordInput>
      </Field>

      <Field name="observacoes">
        <FieldLabel>Instruções de entrega</FieldLabel>
        <Textarea autoResize rows={3} placeholder="Ex.: deixar na portaria" />
      </Field>
    </Stack>
  ),
}

export const ValidationError: Story = {
  render: () => (
    <Field name="email" invalid className="max-w-md">
      <FieldLabel>E-mail</FieldLabel>
      <Input type="email" defaultValue="invalido@" />
      <FieldError match>Informe um endereço de e-mail válido.</FieldError>
    </Field>
  ),
}
