import { clientApi } from "@playground/platform/client/api"
import { useTranslations } from "next-intl"
import { useSyncExternalStore } from "react"

export type Location = { cep: string; warehouse: string }

// Owned by Squad: Entrega.
// The visitor's CEP and warehouse, kept in localStorage so they survive reloads and cross-zone navigations; null until given.
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

export function useWarehouse() {
  const location = useLocation()
  return { ready: location !== undefined, warehouse: location?.warehouse ?? "" }
}

// Saving the location changes the warehouse in price and basket query keys, so those refetch on their own.
export function useSetLocation() {
  const t = useTranslations("Errors")
  return async (form: FormData): Promise<{ error?: string }> => {
    const cep = String(form.get("cep"))
    const res = await clientApi<{ warehouse: string }>("/set-location", { body: { cep } })
    if (!res.ok) return { error: res.status === 400 ? t("invalidCep") : t("saveCep") }
    saveLocation({ cep, warehouse: res.data.warehouse })
    return {}
  }
}
