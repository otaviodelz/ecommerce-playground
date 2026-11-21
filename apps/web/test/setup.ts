import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// Components read the real pt-BR messages without wrapping every render in NextIntlClientProvider.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>()
  const { default: messages } = await import("@/messages/pt-BR.json")
  return { ...actual, useTranslations: (namespace?: never) => actual.createTranslator({ locale: "pt-BR", messages, namespace }) }
})

declare global {
  var __UI_SDK_STRICT__: boolean | undefined
}
globalThis.__UI_SDK_STRICT__ = true

// jsdom gaps ui-sdk needs filled (see the ui-sdk skill's testing guide).
HTMLElement.prototype.showPopover = function () {}
HTMLElement.prototype.hidePopover = function () {}
Element.prototype.getAnimations = () => []
Element.prototype.scrollIntoView = function () {}
Element.prototype.checkVisibility = () => true
Element.prototype.getClientRects = () => [] as unknown as DOMRectList
document.elementFromPoint = () => null
document.elementsFromPoint = () => []
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: "[popover] { display: block !important }",
  }),
)

afterEach(cleanup)
