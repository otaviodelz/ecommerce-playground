import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export function Kbd({ render, ...props }: PartProps<"kbd">) {
  return renderElement("kbd", { ...props, "data-ds": "kbd" }, render)
}
