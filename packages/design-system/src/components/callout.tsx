import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export type CalloutTone = "accent" | "neutral" | "destructive" | "warning"

export type CalloutProps = PartProps<"div"> & {
  tone?: CalloutTone
}

export function Callout({ tone = "accent", render, ...props }: CalloutProps) {
  return renderElement("div", { ...props, "data-ds": "callout", "data-tone": tone }, render)
}

export function CalloutLabel({ render, ...props }: PartProps<"strong">) {
  return renderElement("strong", { ...props, "data-ds": "callout-label" }, render)
}

export function CalloutBody({ render, ...props }: PartProps<"span">) {
  return renderElement("span", { ...props, "data-ds": "callout-body" }, render)
}
