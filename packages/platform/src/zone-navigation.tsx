"use client"

import Form, { type FormProps } from "next/form"
import Link, { type LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { createContext, useContext, type AnchorHTMLAttributes, type FormHTMLAttributes, type Ref } from "react"
import { resolveZone, type ZoneId } from "./zones"

const ZoneContext = createContext<ZoneId>("discovery")

export function ZoneProvider({ zone, children }: { zone: ZoneId; children: React.ReactNode }) {
  return <ZoneContext.Provider value={zone}>{children}</ZoneContext.Provider>
}

export function useCurrentZone(): ZoneId {
  return useContext(ZoneContext)
}

export type ZoneLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string
  prefetch?: LinkProps["prefetch"]
  replace?: boolean
  scroll?: boolean
  ref?: Ref<HTMLAnchorElement>
}

/**
 * Zone-aware navigation link:
 * - Intra-zone links use Next.js `<Link>` for soft navigation and partial prefetching.
 * - Cross-zone links use a native `<a>` so Next.js doesn't waste an RSC prefetch/404 round-trip.
 */
export function ZoneLink({ href, prefetch, replace, scroll, ...props }: ZoneLinkProps) {
  const currentZone = useCurrentZone()
  const targetZone = resolveZone(href)

  if (targetZone !== null && targetZone === currentZone) {
    return <Link href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...props} />
  }

  return <a href={href} {...props} />
}

export type ZoneFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: string
  prefetch?: FormProps["prefetch"]
  replace?: boolean
  scroll?: boolean
}

/**
 * Zone-aware GET form (e.g., header search):
 * uses `next/form` inside the owning zone for instant soft navigation,
 * and a standard `<form method="get">` when submitting across zones.
 */
export function ZoneForm({ action, prefetch, replace, scroll, ...props }: ZoneFormProps) {
  const currentZone = useCurrentZone()
  const targetZone = resolveZone(action)

  if (targetZone !== null && targetZone === currentZone) {
    return <Form action={action} prefetch={prefetch} replace={replace} scroll={scroll} {...props} />
  }

  return <form action={action} method="get" {...props} />
}

/**
 * Programmatic zone-aware navigation (e.g., post-login redirect from `cart-auth` to `discovery`).
 */
export function useZoneNavigate() {
  const currentZone = useCurrentZone()
  const router = useRouter()

  return (href: string) => {
    const targetZone = resolveZone(href)
    if (targetZone !== null && targetZone === currentZone) {
      router.push(href)
      return
    }
    window.location.assign(href)
  }
}
