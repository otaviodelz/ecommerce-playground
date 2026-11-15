import { Hono, type Context } from 'hono'
import { randomUUID } from 'node:crypto'
import { checkPassword, issueTokens, verifyRefreshToken } from './auth.js'
import { DEFAULT_WAREHOUSE, pages, products, users, warehouseForCep, warehouses, type Product } from './data.js'

export const app = new Hono()

const body = (c: Context) => c.req.json().catch(() => ({})) as Promise<Record<string, unknown>>

// Missing header falls back to the default warehouse; an unknown one is rejected.
function warehouseOf(c: Context) {
  const id = c.req.header('warehouse') ?? DEFAULT_WAREHOUSE
  return Object.hasOwn(warehouses, id) ? id : null
}

function priced(p: Product, warehouse: string) {
  const f = warehouses[warehouse].priceFactor
  return { price: Math.round(p.basePrice * f), listPrice: Math.round(p.listPrice * f) }
}

app.post('/guest-login', async (c) => {
  const customerId = randomUUID()
  return c.json({ ...(await issueTokens(customerId, true)), customerId })
})

app.post('/login', async (c) => {
  const { email, password } = await body(c)
  if (typeof email !== 'string' || typeof password !== 'string') {
    return c.json({ error: 'email and password are required' }, 400)
  }
  const user = users.find((u) => u.email === email.trim().toLowerCase())
  if (!user || !checkPassword(password, user.passwordHash)) {
    return c.json({ error: 'invalid credentials' }, 401)
  }
  return c.json({ ...(await issueTokens(user.id, false)), customerId: user.id, name: user.name, email: user.email })
})

app.post('/refresh-token', async (c) => {
  const { refreshToken } = await body(c)
  if (typeof refreshToken !== 'string') return c.json({ error: 'refreshToken is required' }, 400)
  const session = await verifyRefreshToken(refreshToken)
  if (!session) return c.json({ error: 'invalid refresh token' }, 401)
  return c.json({ ...(await issueTokens(session.customerId, session.guest)), customerId: session.customerId })
})

app.post('/set-location', async (c) => {
  const { cep } = await body(c)
  if (typeof cep !== 'string' || !/^\d{5}-?\d{3}$/.test(cep)) {
    return c.json({ error: 'cep must be 8 digits (00000-000)' }, 400)
  }
  return c.json({ warehouse: warehouseForCep(cep.replace('-', '')) })
})

app.get('/page', (c) => {
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const cid = c.req.query('cid') ?? ''
  if (!Object.hasOwn(pages, cid)) return c.json({ error: 'page not found' }, 404)

  const blocks = pages[cid].map((block) => {
    if (block.type !== 'shelf') return block
    const { productIds, ...shelf } = block
    return {
      ...shelf,
      products: productIds.map((id) => {
        const p = products[id]
        return { id: p.id, name: p.name, brand: p.brand, image: p.images[0], ...priced(p, warehouse) }
      }),
    }
  })
  return c.json({ cid, warehouse, blocks })
})

app.get('/product', (c) => {
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const id = c.req.query('id') ?? ''
  if (!Object.hasOwn(products, id)) return c.json({ error: 'product not found' }, 404)

  const { basePrice, ...product } = products[id]
  return c.json({ ...product, ...priced(products[id], warehouse), warehouse })
})
