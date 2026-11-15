export const API_URL = process.env.API_URL ?? "http://localhost:3333"

export const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const
