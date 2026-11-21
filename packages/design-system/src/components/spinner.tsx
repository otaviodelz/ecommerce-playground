import { renderElement, type PartProps } from "@ui-sdk/react/primitive"

export type SpinnerSize = "sm" | "md" | "lg"

export type SpinnerProps = PartProps<"span"> & {
  size?: SpinnerSize
}

export function Spinner({ size, render, ...props }: SpinnerProps) {
  return renderElement(
    "span",
    { "aria-hidden": true, ...props, "data-ds": "spinner", "data-size": size },
    render,
  )
}
