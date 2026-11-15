"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { MenuCategory } from "@/lib/api"

function TopLink({ href, current, className, children }: { href: string; current?: string; className?: string; children: React.ReactNode }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink render={<Link href={href} />} current={href === current} className={className}>
        {children}
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

// Each category opens its subcategories on hover (or click/tap/keyboard); the panel's first link goes to the whole category.
function CategoryLinks({ categories, current }: { categories: MenuCategory[]; current?: string }) {
  return (
    <NavigationMenu className="catbar" aria-label="Categorias">
      <NavigationMenuList>
        <TopLink href="/" current={current}>
          Início
        </TopLink>
        {categories.map((category) => {
          const links = [{ id: category.id, name: `Tudo em ${category.name}` }, ...category.subcategories]
          const active = links.some((link) => `/c/${link.id}` === current)
          return (
            <NavigationMenuItem key={category.id} value={category.id}>
              {/* ui-sdk draws the chevron (::after) and turns it while open. */}
              <NavigationMenuTrigger data-active={active || undefined}>{category.name}</NavigationMenuTrigger>
              {/* Kept in the HTML so crawlers and no-JS visitors still get every subcategory link. */}
              <NavigationMenuContent keepMounted>
                <ul className="catbar-panel">
                  {links.map((link) => (
                    <li key={link.id}>
                      {/* Full prefetch so the category arrives complete, not as the shared fallback. */}
                      <NavigationMenuLink render={<Link href={`/c/${link.id}`} prefetch />} current={`/c/${link.id}` === current}>
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
          Novidades
        </TopLink>
        <TopLink href="/ofertas" current={current} className="deal">
          Ofertas
        </TopLink>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={0} />
    </NavigationMenu>
  )
}

// Reads the URL on the client, so the layout stays static; the Suspense fallback is the same bar without a current item.
function CategoryBar({ categories }: { categories: MenuCategory[] }) {
  return <CategoryLinks categories={categories} current={usePathname()} />
}

export { CategoryBar, CategoryLinks }
