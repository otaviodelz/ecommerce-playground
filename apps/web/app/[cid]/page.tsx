import { useTranslations } from "next-intl"
import { Suspense } from "react"
import { CmsBlocks } from "@/components/cms/cms-blocks"

// Static routes (/basket, /login, /search, /c, /product, /api) win over this segment, so it only sees CMS page ids.
// /home redirects to / in next.config: a redirect here would come after the shell streamed, as a client-side one.
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
