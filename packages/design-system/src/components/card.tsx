import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export type CardProps = PartProps<"article"> & {
  interactive?: boolean
}

export function Card({ interactive, render, ...props }: CardProps) {
  return renderElement(
    "article",
    { ...props, "data-ds": "card", "data-interactive": interactive ? "true" : undefined },
    render,
  )
}

export function CardHeader({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "card-header" }, render)
}

export function CardTitle({ render, ...props }: PartProps<"h3">) {
  return renderElement("h3", { ...props, "data-ds": "card-title" }, render)
}

export function CardDescription({ render, ...props }: PartProps<"p">) {
  return renderElement("p", { ...props, "data-ds": "card-description" }, render)
}

export function CardBody({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "card-body" }, render)
}

export function CardFooter({ render, ...props }: PartProps<"div">) {
  return renderElement("div", { ...props, "data-ds": "card-footer" }, render)
}
