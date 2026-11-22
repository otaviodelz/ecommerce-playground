import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>()
  const { default: messages } = await import("../src/messages/pt-BR.json")
  return { ...actual, useTranslations: (namespace?: never) => actual.createTranslator({ locale: "pt-BR", messages, namespace }) }
})

afterEach(cleanup)
