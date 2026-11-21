"use client"

import { Toggle, ToggleIcon } from "@playground/design-system/toggle"
import { useTranslations } from "next-intl"
import { useOptimistic, useTransition } from "react"
import { useFavorites, useStoreActions } from "@/lib/client/queries"

type SetFavorite = (productId: string, favorite: boolean) => Promise<{ error?: string }>

// The heart fills on press; if the action fails, the optimistic state falls back to the server's `favorited`.
function FavoriteToggle({ productId, name, favorited, action }: { productId: string; name: string; favorited: boolean; action?: SetFavorite }) {
  const t = useTranslations("Favorites")
  const [pressed, setPressed] = useOptimistic(favorited)
  const [, startTransition] = useTransition()
  return (
    <Toggle
      aria-label={t("toggle", { name })}
      className="absolute top-2 right-2 grid h-8 w-8 cursor-pointer place-items-center border border-line bg-bg/80 p-0 text-fg-2 hover:bg-bg/80 hover:text-fg data-pressed:border-line data-pressed:bg-bg/80 data-pressed:text-destructive data-pressed:[&_svg]:fill-current data-disabled:cursor-default"
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

// The visitor's favorites load once in the browser and every card's heart reads them; disabled until they arrive.
function Favorite({ productId, name }: { productId: string; name: string }) {
  const favorites = useFavorites()
  const { setFavorite } = useStoreActions()
  const favorited = favorites.data?.products.some((p) => p.id === productId) ?? false
  return <FavoriteToggle productId={productId} name={name} favorited={favorited} action={favorites.isSuccess ? setFavorite : undefined} />
}

export { Favorite, FavoriteToggle }
