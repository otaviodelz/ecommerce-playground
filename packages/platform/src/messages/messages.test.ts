import { readdirSync, readFileSync } from "node:fs"
import { createTranslator } from "next-intl"
import { expect, test } from "vitest"
import ptBR from "./pt-BR.json"

const keys = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))

test("every market's catalog has exactly the pt-BR keys", () => {
  const reference = keys(ptBR).sort()
  for (const file of readdirSync(__dirname).filter((f) => f.endsWith(".json"))) {
    expect(keys(JSON.parse(readFileSync(`${__dirname}/${file}`, "utf8"))).sort(), file).toEqual(reference)
  }
})

// CLDR puts 0 in pt-BR's "one" category, so the catalog needs =0 to keep "0 itens".
test("pt-BR plurals say 0 itens, 1 item, 2 itens", () => {
  const t = createTranslator({ locale: "pt-BR", messages: ptBR, namespace: "Header" })
  expect([0, 1, 2].map((count) => t("basketLabel", { count }))).toEqual(["Cesta, 0 itens", "Cesta, 1 item", "Cesta, 2 itens"])
})
