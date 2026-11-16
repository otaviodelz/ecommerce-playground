export const API_URL = process.env.API_URL ?? "http://localhost:3333"
// What the browser calls: per-visitor data (prices, basket, favorites, search, CEP) goes straight to the API.
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const
