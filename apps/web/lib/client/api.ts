import { PUBLIC_API_URL } from "../config"
import { getSession } from "./session"

export type ApiResult<T> = { ok: boolean; status: number; data: T & { error?: string; code?: string } }

// Browser → API with the in-memory access token. A 401 (token expired or revoked) renews the session once and retries.
// Network failures come back as status 0 instead of throwing, so callers handle every outcome the same way.
export async function clientApi<T>(path: string, { body, warehouse }: { body?: unknown; warehouse?: string } = {}): Promise<ApiResult<T>> {
  const send = async (renew: boolean) => {
    const { accessToken } = await getSession(renew)
    const headers: Record<string, string> = { authorization: `Bearer ${accessToken}` }
    if (warehouse) headers.warehouse = warehouse
    if (body !== undefined) headers["content-type"] = "application/json"
    return fetch(PUBLIC_API_URL + path, body === undefined ? { headers } : { method: "POST", headers, body: JSON.stringify(body) })
  }
  try {
    let res = await send(false)
    if (res.status === 401) res = await send(true)
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
  } catch {
    return { ok: false, status: 0, data: {} as ApiResult<T>["data"] }
  }
}
