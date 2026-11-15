import { Suspense } from "react"
import { CmsBlocks } from "./cms"

export default function Home() {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <CmsBlocks cid="home" />
    </Suspense>
  )
}
