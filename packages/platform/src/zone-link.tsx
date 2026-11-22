import Link, { type LinkProps } from "next/link"
import type { AnchorHTMLAttributes, Ref } from "react"
import { resolveZone, type ZoneId } from "./zones"

export type ServerZoneLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  zone: ZoneId
  href: string
  prefetch?: LinkProps["prefetch"]
  replace?: boolean
  scroll?: boolean
  ref?: Ref<HTMLAnchorElement>
}

/**
 * Server-compatible zone-aware link (no `"use client"` boundary).
 * - Intra-zone hrefs render Next.js `<Link>` for soft navigation & partial prefetching.
 * - Cross-zone hrefs render a plain server `<a>` with zero client JS or Flight boundary overhead.
 */
export function ServerZoneLink({ zone, href, prefetch, replace, scroll, ...props }: ServerZoneLinkProps) {
  const targetZone = resolveZone(href)

  if (targetZone !== null && targetZone === zone) {
    return <Link href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...props} />
  }

  return <a href={href} {...props} />
}
