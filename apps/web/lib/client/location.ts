import { useSyncExternalStore } from "react"

export type Location = { cep: string; warehouse: string }

// The visitor's CEP and warehouse, kept in localStorage so they survive reloads; null until a CEP is given.
const KEY = "location"
const listeners = new Set<() => void>()
let snapshot: Location | null | undefined

function read(): Location | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null")
    return typeof value?.cep === "string" && typeof value?.warehouse === "string" ? value : null
  } catch {
    return null
  }
}

export function currentLocation() {
  if (snapshot === undefined) snapshot = read()
  return snapshot
}

export function saveLocation(location: Location) {
  try {
    localStorage.setItem(KEY, JSON.stringify(location))
  } catch {}
  snapshot = location
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    snapshot = read()
    listener()
  }
  listeners.add(listener)
  window.addEventListener("storage", onStorage) // another tab changed the CEP
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

// undefined while hydrating (the server can't know it), so warehouse-bound queries wait instead of fetching twice.
export const useLocation = () => useSyncExternalStore(subscribe, currentLocation, () => undefined)
