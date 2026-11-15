import { Hono, type Context } from 'hono'
import { randomUUID } from 'node:crypto'
import { checkPassword, issueTokens, verifyToken } from './auth.js'
import {
  baskets, DEFAULT_WAREHOUSE, MAX_ITEM_QUANTITY, pages, products, users, warehouseForCep, warehouses, type Product,
} from './data.js'

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

const card = (p: Product) => ({ id: p.id, name: p.name, brand: p.brand, image: p.images[0] })

async function customerOf(c: Context) {
  const token = c.req.header('authorization')?.replace(/^Bearer /i, '')
  return token ? (await verifyToken(token, 'access'))?.customerId : undefined
}

function basketView(customerId: string, warehouse: string) {
  const items = [...(baskets.get(customerId) ?? [])].map(([id, quantity]) => {
    const prices = priced(products[id], warehouse)
    return { ...card(products[id]), ...prices, quantity, total: prices.price * quantity }
  })
  return { customerId, warehouse, items, subtotal: items.reduce((sum, i) => sum + i.total, 0) }
}

// Placeholder images for the mock catalog: /images/<slug>.svg?w=&h= draws the slug on a color derived from it.
app.get('/images/:file', (c) => {
  const slug = /^([a-z0-9-]+)\.svg$/.exec(c.req.param('file'))?.[1]
  if (!slug) return c.json({ error: 'image not found' }, 404)
  const size = (v: string | undefined) => Math.min(Math.max(Math.trunc(Number(v)) || 600, 16), 2000)
  const [w, h] = [size(c.req.query('w')), size(c.req.query('h'))]
  const hue = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0) * 7, 0) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    + `<rect width="100%" height="100%" fill="hsl(${hue} 45% 82%)"/>`
    + `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" `
    + `font-size="${Math.round(Math.min(w, h) / 8)}" fill="hsl(${hue} 50% 22%)">${slug}</text></svg>`
  return c.body(svg, 200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' })
})

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
  const session = await verifyToken(refreshToken, 'refresh')
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

// /page and /product are the same for everyone (cacheable); prices come from /prices per warehouse.
app.get('/page', (c) => {
  const cid = c.req.query('cid') ?? ''
  if (!Object.hasOwn(pages, cid)) return c.json({ error: 'page not found' }, 404)

  const blocks = pages[cid].map((block) => {
    if (block.type !== 'shelf') return block
    const { productIds, ...shelf } = block
    return { ...shelf, products: productIds.map((id) => card(products[id])) }
  })
  return c.json({ cid, blocks })
})

app.get('/product', (c) => {
  const id = c.req.query('id') ?? ''
  if (!Object.hasOwn(products, id)) return c.json({ error: 'product not found' }, 404)

  const { basePrice, listPrice, ...product } = products[id]
  return c.json(product)
})

// Batch prices: /prices?ids=a,b,c with the warehouse header. Unknown ids are left out.
app.get('/prices', (c) => {
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const ids = (c.req.query('ids') ?? '').split(',').filter(Boolean)
  if (ids.length === 0 || ids.length > 100) return c.json({ error: 'ids must list 1 to 100 product ids' }, 400)

  const prices = Object.fromEntries(ids.filter((id) => Object.hasOwn(products, id)).map((id) => [id, priced(products[id], warehouse)]))
  return c.json({ warehouse, prices })
})

// Basket routes need an access token (guest or logged in) and price items by the warehouse header.
app.get('/basket', async (c) => {
  const customerId = await customerOf(c)
  if (!customerId) return c.json({ error: 'unauthorized' }, 401)
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  return c.json(basketView(customerId, warehouse))
})

app.post('/add-item', async (c) => {
  const customerId = await customerOf(c)
  if (!customerId) return c.json({ error: 'unauthorized' }, 401)
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const { productId, quantity = 1 } = await body(c)
  if (typeof productId !== 'string' || !Object.hasOwn(products, productId)) {
    return c.json({ error: 'product not found' }, 404)
  }
  const basket = baskets.get(customerId) ?? new Map<string, number>()
  const next = (basket.get(productId) ?? 0) + (quantity as number)
  if (!Number.isInteger(quantity) || (quantity as number) < 1 || next > MAX_ITEM_QUANTITY) {
    return c.json({ error: `quantity must be a positive integer, max ${MAX_ITEM_QUANTITY} per item` }, 400)
  }
  baskets.set(customerId, basket.set(productId, next))
  return c.json(basketView(customerId, warehouse))
})

app.post('/delete-item', async (c) => {
  const customerId = await customerOf(c)
  if (!customerId) return c.json({ error: 'unauthorized' }, 401)
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const { productId } = await body(c)
  if (typeof productId !== 'string') return c.json({ error: 'productId is required' }, 400)
  baskets.get(customerId)?.delete(productId)
  return c.json(basketView(customerId, warehouse))
})
