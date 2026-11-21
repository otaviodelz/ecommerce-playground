import { Button as UiButton } from "@ui-sdk/react/button"
import type { ComponentProps } from "react"

export type ButtonVariant = "outline" | "solid" | "accent" | "ghost" | "destructive"
export type ButtonSize = "sm" | "md" | "lg"

export type ButtonProps = ComponentProps<typeof UiButton> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant, size, ...props }: ButtonProps) {
  return (
    <UiButton
      data-variant={variant === "outline" ? undefined : variant}
      data-size={size === "md" ? undefined : size}
      {...props}
    />
  )
}

export type { ButtonActionDetails, ButtonApi, ButtonOptions, ButtonPrimitive, ButtonState } from "@ui-sdk/react/button"
