import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export type BadgeTone = "default" | "accent" | "destructive" | "warning"
export type BadgeVariant = "outline" | "solid"

export type BadgeProps = PartProps<"span"> & {
  tone?: BadgeTone
  variant?: BadgeVariant
}

export function Badge({ tone = "default", variant = "outline", render, ...props }: BadgeProps) {
  return renderElement(
    "span",
    { ...props, "data-ds": "badge", "data-tone": tone, "data-variant": variant },
    render,
  )
}
