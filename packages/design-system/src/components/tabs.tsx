import {
  Tabs as UiTabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
  createTabsController,
} from "@ui-sdk/react/tabs"
import type { ComponentProps } from "react"

export type TabsVariant = "line" | "terminal"

export type TabsProps = ComponentProps<typeof UiTabs> & {
  variant?: TabsVariant
}

export function Tabs({ variant = "line", ...props }: TabsProps) {
  return <UiTabs data-variant={variant} {...props} />
}

export { TabsIndicator, TabsList, TabsPanel, TabsTab, createTabsController }
export type { TabsController, TabsOptions, TabsState } from "@ui-sdk/react/tabs"
