import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

const terminalTheme = create({
  base: "dark",
  brandTitle: "playground // design-system",
  colorPrimary: "#fafafa",
  colorSecondary: "#54d483",
  appBg: "#0c0c0c",
  appContentBg: "#0c0c0c",
  appPreviewBg: "#0c0c0c",
  appBorderColor: "#2e2e2e",
  appBorderRadius: 0,
  fontBase: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontCode: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  textColor: "#fafafa",
  textInverseColor: "#0c0c0c",
  textMutedColor: "#8f8f8f",
  barTextColor: "#aeaeae",
  barHoverColor: "#fafafa",
  barSelectedColor: "#54d483",
  barBg: "#161616",
  inputBg: "#161616",
  inputBorder: "#6a6a6a",
  inputTextColor: "#fafafa",
  inputBorderRadius: 0,
  buttonBg: "#1a1a1a",
  buttonBorder: "#6a6a6a",
  booleanBg: "#161616",
  booleanSelectedBg: "#54d483",
})

addons.setConfig({
  theme: terminalTheme,
})
