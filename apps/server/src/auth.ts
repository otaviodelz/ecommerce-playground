import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { sign } from 'hono/jwt'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production')
}
const secret = process.env.JWT_SECRET ?? 'dev-only-secret'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 32).toString('hex')}`
}

export function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const a = scryptSync(password, salt, 32)
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function issueTokens(customerId: string, guest: boolean) {
  const now = Math.floor(Date.now() / 1000)
  return {
    accessToken: await sign({ sub: customerId, guest, type: 'access', iat: now, exp: now + 15 * 60 }, secret),
    refreshToken: await sign({ sub: customerId, guest, type: 'refresh', iat: now, exp: now + 7 * 24 * 3600 }, secret),
  }
}
