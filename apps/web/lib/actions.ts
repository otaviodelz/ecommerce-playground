"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { api } from "@/lib/api"
import { cookieOptions } from "@/lib/config"

export type FormAction = (form: FormData) => Promise<{ error?: string }>

export async function login(form: FormData) {
  const res = await api<{ accessToken: string; refreshToken: string; name: string }>("/login", {
    email: form.get("email"),
    password: form.get("password"),
  })
  if (!res.ok) return { error: res.status === 401 ? "E-mail ou senha inválidos." : (res.data.error ?? "Erro ao entrar.") }

  const jar = await cookies()
  jar.set("at", res.data.accessToken, cookieOptions)
  jar.set("rt", res.data.refreshToken, cookieOptions)
  jar.set("name", res.data.name, cookieOptions)
  redirect("/")
}

export async function setLocation(form: FormData) {
  const res = await api<{ warehouse: string }>("/set-location", { cep: form.get("cep") })
  if (!res.ok) return { error: "CEP inválido. Use 00000-000." }
  const jar = await cookies()
  jar.set("wh", res.data.warehouse, cookieOptions)
  jar.set("cep", String(form.get("cep")), cookieOptions)
  return {}
}

export type AddItem = (productId: string) => Promise<{ error?: string; locationRequired?: boolean }>

export async function addItem(productId: string) {
  const res = await api<{ code?: string }>("/add-item", { productId })
  // Not in stock in every warehouse and no CEP yet: the button asks for one, then calls this again.
  if (res.data.code === "location_required") return { locationRequired: true }
  if (res.data.code === "out_of_stock") return { error: "Sem estoque para o seu CEP." }
  if (!res.ok) return { error: "Não foi possível adicionar o item." }
  // Re-renders the header's basket count; the visitor stays on the page.
  refresh()
  return {}
}

export async function setFavorite(productId: string, favorite: boolean) {
  const res = await api(favorite ? "/add-favorite" : "/delete-favorite", { productId })
  if (!res.ok) return { error: res.data.error ?? "Não foi possível atualizar os favoritos." }
  // Re-renders the header count, every heart and /favorites with the saved state.
  refresh()
  return {}
}

export async function deleteItem(form: FormData) {
  const res = await api("/delete-item", { productId: form.get("productId") })
  if (!res.ok) throw new Error(res.data.error ?? "Não foi possível remover o item.")
  refresh()
}
