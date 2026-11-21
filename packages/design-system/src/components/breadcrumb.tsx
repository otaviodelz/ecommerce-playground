import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export function Breadcrumb({ render, ...props }: PartProps<"nav">) {
  return renderElement("nav", { ...props, "data-ds": "breadcrumb" }, render)
}

export function BreadcrumbList({ render, ...props }: PartProps<"ol">) {
  return renderElement("ol", { ...props, "data-ds": "breadcrumb-list" }, render)
}

export function BreadcrumbItem({ render, ...props }: PartProps<"li">) {
  return renderElement("li", { ...props, "data-ds": "breadcrumb-item" }, render)
}

export function BreadcrumbSeparator({ children = "›", render, ...props }: PartProps<"span">) {
  return renderElement(
    "span",
    { "aria-hidden": true, ...props, "data-ds": "breadcrumb-separator", children },
    render,
  )
}
