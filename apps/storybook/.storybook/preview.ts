import type { Preview } from "@storybook/react-vite"
import "../src/storybook.css"

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "terminal",
      values: [
        { name: "terminal", value: "#0c0c0c" },
        { name: "surface", value: "#161616" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    layout: "padded",
  },
}

export default preview
