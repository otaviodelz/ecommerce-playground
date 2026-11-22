import { useTranslations } from "next-intl"
import { Suspense } from "react"
import { CmsBlocks } from "@/components/cms/cms-blocks"

// Static routes (/c, /search, /api) and beforeFiles zone rewrites (/product, /basket, /login, /favorites) win over this segment.
async function Content({ params }: Pick<PageProps<"/[cid]">, "params">) {
  const { cid } = await params
  return <CmsBlocks cid={cid} />
}

export default function CmsPage({ params }: PageProps<"/[cid]">) {
  const t = useTranslations("Common")
  return (
    <Suspense fallback={<p className="text-fg-3">{t("loading")}</p>}>
      <Content params={params} />
    </Suspense>
  )
}
