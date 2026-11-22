import { getContent } from "@playground/platform/api"

// Old /page?cid= links move to /<cid>, or to /c/<cid> for the pages that became categories.
export async function GET(request: Request) {
  const cid = new URL(request.url).searchParams.get("cid")
  if (!cid || !/^[a-z0-9-]+$/.test(cid)) return new Response("Not found", { status: 404 })
  const isCategory = (await getContent(`/category?id=${cid}`)).status === 200
  const path = isCategory ? `/c/${cid}` : cid === "home" ? "/" : `/${cid}`
  return new Response(null, { status: 308, headers: { location: path } })
}
