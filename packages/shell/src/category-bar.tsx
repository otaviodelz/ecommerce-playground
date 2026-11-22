"use client"

import type { MenuCategory } from "@playground/platform/api"
import { ZoneLink } from "@playground/platform/zone-navigation"
import { cn } from "@playground/design-system/cn"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@playground/design-system/navigation-menu"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

const navItemClass =
  "inline-flex items-center gap-1.5 border-0 border-b border-transparent py-2.5 text-fg-2 no-underline hover:text-fg aria-[current=page]:border-fg aria-[current=page]:text-fg"

function TopLink({ href, current, className, children }: { href: string; current?: string; className?: string; children: React.ReactNode }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink render={<ZoneLink href={href} />} current={href === current} className={cn(navItemClass, className)}>
        {children}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

// Each category opens its subcategories on hover (or click/tap/keyboard); the panel's first link goes to the whole category.
function CategoryLinks({ categories, current }: { categories: MenuCategory[]; current?: string }) {
  const t = useTranslations("Nav")
  return (
    <NavigationMenu className="border-b border-line font-mono text-[0.8rem]" aria-label={t("categories")}>
      <NavigationMenuList className="m-0 flex list-none gap-6 overflow-x-auto px-4 whitespace-nowrap [scrollbar-width:none]">
        <TopLink href="/" current={current}>
          {t("home")}
        </TopLink>
        {categories.map((category) => {
          const links = [{ id: category.id, name: t("allIn", { category: category.name }) }, ...category.subcategories]
          const active = links.some((link) => `/c/${link.id}` === current)
          return (
            <NavigationMenuItem key={category.id} value={category.id}>
              <NavigationMenuTrigger
                data-active={active || undefined}
                className={cn(
                  navItemClass,
                  "h-auto cursor-pointer rounded-none bg-transparent px-0 font-[inherit] hover:bg-transparent data-open:text-fg data-[active]:border-fg data-[active]:text-fg",
                )}
              >
                {category.name}
              </NavigationMenuTrigger>
              {/* Kept in the HTML so crawlers and no-JS visitors still get every subcategory link. */}
              <NavigationMenuContent keepMounted>
                <ul className="m-0 grid min-w-56 list-none p-1.5">
                  {links.map((link, index) => (
                    <li key={link.id} className={index === 0 ? "mb-1 border-b border-line pb-1" : undefined}>
                      {/* Full prefetch inside discovery so the category arrives complete, not as the shared fallback. */}
                      <NavigationMenuLink
                        render={<ZoneLink href={`/c/${link.id}`} prefetch />}
                        current={`/c/${link.id}` === current}
                        className="block px-2.5 py-1.5 text-fg-2 no-underline hover:bg-surface-2 hover:text-fg focus-visible:bg-surface-2 focus-visible:text-fg aria-[current=page]:text-fg aria-[current=page]:before:text-accent aria-[current=page]:before:content-['›_']"
                      >
                        {link.name}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
        <TopLink href="/novidades" current={current}>
          {t("news")}
        </TopLink>
        <TopLink href="/ofertas" current={current} className="text-accent">
          {t("deals")}
        </TopLink>
      </NavigationMenuList>
      <NavigationMenuViewport
        sideOffset={0}
        className="h-(--viewport-height) w-(--viewport-width) overflow-hidden border border-line bg-bg transition-[width,height,left] duration-150 motion-reduce:transition-none [&>[data-slot=navigation-menu-content]]:absolute [&>[data-slot=navigation-menu-content]]:top-0 [&>[data-slot=navigation-menu-content]]:start-0"
      />
    </NavigationMenu>
  )
}

// Reads the URL on the client, so the layout stays static; the Suspense fallback is the same bar without a current item.
function CategoryBar({ categories }: { categories: MenuCategory[] }) {
  return <CategoryLinks categories={categories} current={usePathname()} />
}

export { CategoryBar, CategoryLinks }
