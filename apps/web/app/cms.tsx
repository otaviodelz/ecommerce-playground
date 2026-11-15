import Link from "next/link"
import { notFound } from "next/navigation"
import { getContent, type Block, type ProductCard } from "@/lib/api"
import { Price } from "./price"

function ProductTile({ product, ids }: { product: ProductCard; ids: string }) {
  return (
    <Link href={`/product?id=${product.id}`} className="tile">
      <img src={product.image} alt="" width={300} height={300} />
      <h3>{product.name}</h3>
      <p className="muted">{product.brand}</p>
      <Price id={product.id} ids={ids} />
    </Link>
  )
}

async function CmsBlocks({ cid }: { cid: string }) {
  const res = await getContent<{ blocks: Block[] }>(`/page?cid=${encodeURIComponent(cid)}`)
  if (res.status === 404) notFound()
  const { blocks } = res.data
  const ids = [...new Set(blocks.flatMap((b) => (b.type === "shelf" ? b.products.map((p) => p.id) : [])))].join(",")

  return blocks.map((block) =>
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
              <ProductTile product={product} ids={ids} />
            </li>
          ))}
        </ul>
      </section>
    ),
  )
}

export { CmsBlocks }
