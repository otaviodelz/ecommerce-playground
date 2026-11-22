import { revalidateTag } from "next/cache"
import { timingSafeEqual } from "node:crypto"
import { getRevalidationTargets, getZoneOrigin, type ZoneId } from "./zones"

const matches = (given: string | null, secret: string) =>
  given !== null && given.length === secret.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret))

/**
 * Creates a zone's `POST /api/revalidate` route handler.
 * When `fanOut` is true (primary zone), the webhook forwards shared/downstream tags
 * (e.g. `/categories`, `prices`, `/product?id=...`) to the owning zones automatically.
 */
export function createRevalidateHandler({ zone, fanOut = false }: { zone: ZoneId; fanOut?: boolean }) {
  return async function POST(request: Request) {
    const secret = process.env.REVALIDATE_SECRET
    if (!secret || !matches(request.headers.get("x-revalidate-secret"), secret)) {
      return Response.json({ error: "unauthorized" }, { status: 401 })
    }
    const { tag } = await request.json().catch(() => ({}))
    if (typeof tag !== "string" || !tag) return Response.json({ error: "tag is required" }, { status: 400 })

    const targets = fanOut ? getRevalidationTargets(tag) : [zone]
    const results: Record<string, "ok" | "error"> = {}

    if (targets.includes(zone)) {
      revalidateTag(tag, "max")
      results[zone] = "ok"
    }

    if (fanOut) {
      const peers = targets.filter((target) => target !== zone)
      await Promise.all(
        peers.map(async (peer) => {
          try {
            const res = await fetch(`${getZoneOrigin(peer)}/api/revalidate`, {
              method: "POST",
              headers: { "content-type": "application/json", "x-revalidate-secret": secret },
              body: JSON.stringify({ tag }),
            })
            results[peer] = res.ok ? "ok" : "error"
          } catch {
            results[peer] = "error"
          }
        }),
      )
    }

    return Response.json({ revalidated: tag, zones: results })
  }
}
