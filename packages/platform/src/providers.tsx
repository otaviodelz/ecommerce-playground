"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ZoneProvider } from "./zone-navigation"
import type { ZoneId } from "./zones"

const CACHE_KEY = "playground:zone-query-cache"
const CACHE_TTL_MS = 30_000
const PERSISTED_ROOTS = new Set(["session", "favorites", "basket"])

type CacheEntry = { queryKey: readonly unknown[]; data: unknown; dataUpdatedAt: number }
type CacheSnapshot = Record<string, CacheEntry>

let memorySnapshot: CacheSnapshot | null = null
let flushScheduled = false

function readSnapshot(): CacheSnapshot {
  if (memorySnapshot) return memorySnapshot
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "{}")
    memorySnapshot = parsed && typeof parsed === "object" ? (parsed as CacheSnapshot) : {}
  } catch {
    memorySnapshot = {}
  }
  return memorySnapshot
}

function scheduleFlush() {
  if (flushScheduled) return
  flushScheduled = true
  queueMicrotask(() => {
    flushScheduled = false
    if (!memorySnapshot) return
    const now = Date.now()
    const pruned: CacheSnapshot = {}
    for (const [hash, entry] of Object.entries(memorySnapshot)) {
      if (now - entry.dataUpdatedAt <= CACHE_TTL_MS) pruned[hash] = entry
    }
    memorySnapshot = pruned
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(pruned))
    } catch {}
  })
}

export function clearPersistedStoreCache() {
  memorySnapshot = {}
  try {
    sessionStorage.removeItem(CACHE_KEY)
  } catch {}
}

// Per-visitor data is fetched in the browser; 30s fresh keeps navigation from refetching what every page shares (basket, favorites).
// Shared header queries are mirrored to sessionStorage (30s TTL) with microtask batching so cross-zone hard navigations
// keep counts & hearts warm without flashing [0] or causing repeated synchronous JSON parse/stringify work on boot.
export function Providers({ zone, children }: { zone: ZoneId; children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: CACHE_TTL_MS, retry: 1 } } }))

  useEffect(() => {
    const now = Date.now()
    const snapshot = readSnapshot()
    for (const entry of Object.values(snapshot)) {
      if (!Array.isArray(entry?.queryKey) || typeof entry.dataUpdatedAt !== "number") continue
      if (now - entry.dataUpdatedAt > CACHE_TTL_MS) continue
      if (client.getQueryData(entry.queryKey) === undefined) {
        client.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.dataUpdatedAt })
      }
    }

    return client.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return
      const { query } = event
      const root = query.queryKey[0]
      if (typeof root !== "string" || !PERSISTED_ROOTS.has(root)) return
      if (query.state.status !== "success") return

      const current = readSnapshot()
      if (current[query.queryHash]?.dataUpdatedAt === query.state.dataUpdatedAt) return

      current[query.queryHash] = {
        queryKey: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }
      scheduleFlush()
    })
  }, [client])

  return (
    <ZoneProvider zone={zone}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ZoneProvider>
  )
}
