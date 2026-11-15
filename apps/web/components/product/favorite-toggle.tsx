"use client"

import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { useOptimistic, useTransition } from "react"

type SetFavorite = (productId: string, favorite: boolean) => Promise<{ error?: string }>

// The heart fills on press; if the action fails, the optimistic state falls back to the server's `favorited`.
function FavoriteToggle({ productId, name, favorited, action }: { productId: string; name: string; favorited: boolean; action?: SetFavorite }) {
  const [pressed, setPressed] = useOptimistic(favorited)
  const [, startTransition] = useTransition()
  return (
    <Toggle
      aria-label={`Favoritar ${name}`}
      className="favorite"
      pressed={pressed}
      disabled={!action}
      onPressedChange={(next) =>
        startTransition(async () => {
          setPressed(next)
          await action?.(productId, next)
        })
      }
    >
      <ToggleIcon>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
        </svg>
      </ToggleIcon>
    </Toggle>
  )
}

export { FavoriteToggle }
