import { Suspense } from "react"
import { CmsBlocks } from "../cms"

async function Content({ searchParams }: Pick<PageProps<"/page">, "searchParams">) {
  const { cid } = await searchParams
  return <CmsBlocks cid={String(cid ?? "")} />
}

export default function CmsPage({ searchParams }: PageProps<"/page">) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  )
}
