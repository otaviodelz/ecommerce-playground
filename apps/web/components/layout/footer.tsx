import Link from "next/link"
import { getContent, type MenuCategory } from "@/lib/api"

// Same menu tree as the category bar (cached content), so the footer lands in the static shell too.
async function Footer() {
  const { data } = await getContent<{ categories: MenuCategory[] }>("/categories")
  return (
    <footer className="footer">
      <div className="footer-columns">
        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop">Loja</h2>
          <ul>
            {data.categories.map((category) => (
              <li key={category.id}>
                <Link href={`/c/${category.id}`}>{category.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/novidades">Novidades</Link>
            </li>
            <li>
              <Link href="/ofertas">Ofertas</Link>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-account">
          <h2 id="footer-account">Sua conta</h2>
          <ul>
            <li>
              <Link href="/login">Entrar</Link>
            </li>
            <li>
              <Link href="/favorites">Favoritos</Link>
            </li>
            <li>
              <Link href="/basket">Cesta</Link>
            </li>
          </ul>
        </nav>
        <section aria-labelledby="footer-help">
          <h2 id="footer-help">Comprar aqui</h2>
          <ul>
            <li>Frete grátis acima de R$ 199</li>
            <li>Troca em até 30 dias</li>
            <li>Até 10x sem juros no cartão</li>
            <li>Preço e estoque pelo seu CEP</li>
          </ul>
        </section>
      </div>
      <p className="footer-legal">
        <span className="logo">playground</span> © Playground Store. Loja de estudo: produtos, preços e pedidos são fictícios.
      </p>
    </footer>
  )
}

export { Footer }
