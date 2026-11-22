// Reads exp without verifying (the API verifies); only used to renew a token shortly before it expires. 0 when unreadable.
export function tokenExpiry(jwt: string) {
  try {
    return JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).exp * 1000
  } catch {
    return 0
  }
}

// Renews 30s early so a request never leaves with a token that expires on the way.
export const expiresSoon = (expiresAt: number) => expiresAt < Date.now() + 30_000
