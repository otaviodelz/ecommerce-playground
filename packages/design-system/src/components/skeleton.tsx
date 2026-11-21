import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export function Skeleton({ render, ...props }: PartProps<"span">) {
  return renderElement("span", { ...props, "data-ds": "skeleton" }, render)
}
