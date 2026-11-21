import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
  Row,
  Stack,
} from "@playground/design-system"

const meta: Meta = {
  title: "Overlays/Dialog & AlertDialog",
}

export default meta
type Story = StoryObj

export const ModalAndConfirmation: Story = {
  render: () => (
    <Row gap="md">
      <Dialog>
        <DialogTrigger>Informar CEP</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <Stack gap="md">
            <DialogTitle>Onde entregar?</DialogTitle>
            <DialogDescription className="text-fg-3">
              Informe seu CEP para consultar preço e estoque no depósito mais próximo.
            </DialogDescription>
            <Field name="cep">
              <FieldLabel>CEP</FieldLabel>
              <Input mono placeholder="00000-000" inputMode="numeric" />
            </Field>
            <Row>
              <DialogClose data-variant="solid">Salvar CEP</DialogClose>
              <DialogClose>Cancelar</DialogClose>
            </Row>
          </Stack>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger data-variant="destructive">Esvaziar cesta</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <Stack gap="md">
            <AlertDialogTitle>Remover todos os itens?</AlertDialogTitle>
            <AlertDialogDescription className="text-fg-3">
              Esta ação remove todos os produtos adicionados à sua cesta atual.
            </AlertDialogDescription>
            <Row>
              <AlertDialogClose>Voltar</AlertDialogClose>
              <AlertDialogClose
                value="confirm"
                data-variant="destructive"
                data-agent-confirm="Remove todos os itens da cesta"
              >
                Confirmar limpeza
              </AlertDialogClose>
            </Row>
          </Stack>
        </AlertDialogContent>
      </AlertDialog>
    </Row>
  ),
}
