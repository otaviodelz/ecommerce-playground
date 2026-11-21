import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export type Gap = "xs" | "sm" | "md" | "lg" | "xl"

export type StackProps = PartProps<"div"> & {
  gap?: Gap
}

export function Stack({ gap = "md", render, ...props }: StackProps) {
  return renderElement("div", { ...props, "data-ds": "stack", "data-gap": gap }, render)
}

export type RowProps = PartProps<"div"> & {
  gap?: Exclude<Gap, "xl">
}

export function Row({ gap = "sm", render, ...props }: RowProps) {
  return renderElement("div", { ...props, "data-ds": "row", "data-gap": gap }, render)
}

export function Container({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "container" }, render)
}

export function PageHeader({ render, ...props }: PartProps<"header">) {
  return renderElement("header", { ...props, "data-ds": "page-header" }, render)
}

export function SectionHeader({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "section-header" }, render)
}

export function InfoBar({ render, ...props }: PartProps<"p">) {
  return renderElement("p", { ...props, "data-ds": "info-bar" }, render)
}
