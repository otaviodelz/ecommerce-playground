import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Button,
  Row,
  Stack,
  Toast,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from "@playground/design-system"
import { useEffect, useState } from "react"

const meta: Meta = {
  title: "Overlays/Toast",
}

export default meta
type Story = StoryObj

export const Notifications: Story = {
  render: function ToastStory() {
    const [toaster] = useState(() => createToaster())
    useEffect(
      () => () => {
        toaster.dismiss()
      },
      [toaster],
    )

    return (
      <>
        <Row gap="md">
          <Button
            variant="accent"
            onClick={() =>
              toaster("Produto adicionado", {
                description: "Tênis Runner foi adicionado à sua cesta.",
              })
            }
          >
            Toast de sucesso
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toaster.error("Sem estoque", {
                description: "Este produto está indisponível para o seu CEP.",
              })
            }
          >
            Toast de erro
          </Button>
        </Row>
        <ToastRegion toaster={toaster} data-agent-hidden>
          {() => (
            <Toast>
              <Stack gap="xs">
                <ToastTitle />
                <ToastDescription />
              </Stack>
            </Toast>
          )}
        </ToastRegion>
      </>
    )
  },
}
