import { Textarea as UiTextarea } from "@ui-sdk/react/textarea"
import type { ComponentProps } from "react"

export type TextareaProps = ComponentProps<typeof UiTextarea> & {
  mono?: boolean
}

export function Textarea({ mono, ...props }: TextareaProps) {
  return <UiTextarea data-mono={mono ? "" : undefined} {...props} />
}

export type { TextareaOptions, TextareaState } from "@ui-sdk/react/textarea"
