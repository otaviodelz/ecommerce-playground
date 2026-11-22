import { createStorefrontMetadata, StorefrontLayout } from "@playground/shell/layout"
import "./globals.css"

export const generateMetadata = createStorefrontMetadata

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <StorefrontLayout zone="discovery">{children}</StorefrontLayout>
}
