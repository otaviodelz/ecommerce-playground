import { revalidateTag } from "next/cache"
import { timingSafeEqual } from "node:crypto"

const matches = (given: string | null, secret: string) =>
  given !== null && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret))

// CMS/catalog webhook: POST { "tag": "/page?cid=home" | "/category?id=..." | "/product?id=..." | "/categories" } with x-revalidate-secret.
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !matches(request.headers.get("x-revalidate-secret"), secret)) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }
  const { tag } = await request.json().catch(() => ({}))
  if (typeof tag !== "string" || !tag) return Response.json({ error: "tag is required" }, { status: 400 })
  revalidateTag(tag, "max")
  return Response.json({ revalidated: tag })
}
