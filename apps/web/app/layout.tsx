import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import "@ui-sdk/core/web.css"
import "./globals.css"
import { setLocation } from "./actions"
import { CepForm } from "./forms"

export const metadata: Metadata = {
  title: "Playground Store",
  description: "Ecommerce playground",
}

async function Session() {
  const jar = await cookies()
  const name = jar.get("name")?.value
  return (
    <>
      <CepForm action={setLocation} defaultCep={jar.get("cep")?.value} />
      <nav className="nav">
        <span className="muted">Estoque: {jar.get("wh")?.value ?? "br-01"}</span>
        <Link href="/basket">Cesta</Link>
        {name ? <span>Olá, {name}</span> : <Link href="/login">Entrar</Link>}
      </nav>
    </>
  )
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <Link href="/" className="logo">
            Playground Store
          </Link>
          <Suspense fallback={null}>
            <Session />
          </Suspense>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
