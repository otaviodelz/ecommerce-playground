import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export function CellGrid({ render, ...props }: PartProps<"ul">) {
  return renderElement("ul", { ...props, "data-ds": "cell-grid" }, render)
}

export function CellGridItem({ render, ...props }: PartProps<"li">) {
  return renderElement("li", { ...props, "data-ds": "cell-grid-item" }, render)
}
