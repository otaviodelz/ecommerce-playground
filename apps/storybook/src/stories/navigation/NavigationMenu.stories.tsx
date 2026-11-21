import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@playground/design-system"

const meta: Meta<typeof NavigationMenu> = {
  title: "Navigation/NavigationMenu",
  component: NavigationMenu,
}

export default meta
type Story = StoryObj<typeof NavigationMenu>

const categories = [
  { id: "corrida", name: "Corrida", subs: ["Tênis", "Roupas", "Meias"] },
  { id: "acessorios", name: "Acessórios", subs: ["Mochilas", "Garrafas", "Bonés"] },
  { id: "eletronicos", name: "Eletrônicos", subs: ["Relógios GPS", "Fones"] },
]

export const CategoryBar: Story = {
  render: () => (
    <NavigationMenu aria-label="Categorias" className="border-b border-line font-mono text-xs">
      <NavigationMenuList className="flex list-none gap-6 p-0">
        <NavigationMenuItem>
          <NavigationMenuLink href="#inicio" current className="inline-flex border-b border-fg py-2.5 text-fg no-underline">
            Início
          </NavigationMenuLink>
        </NavigationMenuItem>
        {categories.map((cat) => (
          <NavigationMenuItem key={cat.id} value={cat.id}>
            <NavigationMenuTrigger className="inline-flex h-auto items-center gap-1.5 border-0 bg-transparent py-2.5 text-fg-2 hover:text-fg">
              {cat.name}
            </NavigationMenuTrigger>
            <NavigationMenuContent keepMounted>
              <ul className="grid min-w-56 list-none bg-bg p-1.5">
                <li className="mb-1 border-b border-line pb-1">
                  <NavigationMenuLink href={`#${cat.id}`} className="block px-2.5 py-1.5 text-fg-2 no-underline hover:bg-surface-2 hover:text-fg">
                    Tudo em {cat.name}
                  </NavigationMenuLink>
                </li>
                {cat.subs.map((sub) => (
                  <li key={sub}>
                    <NavigationMenuLink href={`#${sub.toLowerCase()}`} className="block px-2.5 py-1.5 text-fg-2 no-underline hover:bg-surface-2 hover:text-fg">
                      {sub}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="#ofertas" className="inline-flex py-2.5 text-accent no-underline">
            Ofertas
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport sideOffset={0} className="border border-line bg-bg" />
    </NavigationMenu>
  ),
}
