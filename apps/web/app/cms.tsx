import Link from "next/link"
import { notFound } from "next/navigation"
import { api, brl, type Block, type ProductCard } from "@/lib/api"

function Prices({ price, listPrice }: { price: number; listPrice: number }) {
  return (
    <p>
      {listPrice > price && <s className="list-price">{brl(listPrice)}</s>} <span className="price">{brl(price)}</span>
    </p>
  )
}

function ProductTile({ product }: { product: ProductCard }) {
  return (
    <Link href={`/product?id=${product.id}`} className="tile">
      <img src={product.image} alt="" width={300} height={300} />
      <h3>{product.name}</h3>
      <p className="muted">{product.brand}</p>
      <Prices price={product.price} listPrice={product.listPrice} />
    </Link>
  )
}

async function CmsBlocks({ cid }: { cid: string }) {
  const res = await api<{ blocks: Block[] }>(`/page?cid=${encodeURIComponent(cid)}`)
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error(res.data.error ?? "Erro ao carregar a página.")

  return res.data.blocks.map((block) =>
    block.type === "banner" ? (
      <Link key={block.id} href={block.link} className="banner">
        <img src={block.image} alt={`Banner ${block.id}`} width={1200} height={400} />
      </Link>
    ) : (
      <section key={block.id}>
        <h2>{block.title}</h2>
        <ul className="grid">
          {block.products.map((product) => (
            <li key={product.id}>
              <ProductTile product={product} />
            </li>
          ))}
        </ul>
      </section>
    ),
  )
}

export { CmsBlocks, Prices }
