import {
  Input as UiInput,
  InputClear,
  InputGroup,
  createInputController,
} from "@ui-sdk/react/input"
import type { ComponentProps } from "react"

export type InputProps = ComponentProps<typeof UiInput> & {
  mono?: boolean
}

export function Input({ mono, ...props }: InputProps) {
  return <UiInput data-mono={mono ? "" : undefined} {...props} />
}

export { InputClear, InputGroup, createInputController }
export type { InputController, InputOptions, InputState } from "@ui-sdk/react/input"
