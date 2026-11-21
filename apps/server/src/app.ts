import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { randomUUID } from 'node:crypto'
import { checkPassword, issueTokens, verifyToken } from './auth.js'
import {
  baskets, categories, DEFAULT_WAREHOUSE, favorites, inStock, MAX_ITEM_QUANTITY, pages, products, users, warehouseForCep, warehouses,
  type Product,
} from './data.js'

export const app = new Hono<{ Variables: { customerId: string } }>()

// The storefront's browser calls the API directly, with the access token it keeps in memory.
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', allowHeaders: ['authorization', 'content-type', 'warehouse'] }))

// Simulated network latency to exercise the storefront's loading states; API_DELAY_MS=0 turns it off.
app.use(async (_, next) => {
  await new Promise((resolve) => setTimeout(resolve, Number(process.env.API_DELAY_MS ?? 300)))
  await next()
})

// Every route needs an access token (guest or logged in), except signing in and the placeholder images (<img> can't send headers).
const PUBLIC_ROUTES = new Set(['/guest-login', '/login', '/refresh-token'])

app.use(async (c, next) => {
  if (PUBLIC_ROUTES.has(c.req.path) || c.req.path.startsWith('/images/')) return next()
  const token = c.req.header('authorization')?.replace(/^Bearer /i, '')
  const customerId = token ? (await verifyToken(token, 'access'))?.customerId : undefined
  if (!customerId) return c.json({ error: 'unauthorized' }, 401)
  c.set('customerId', customerId)
  await next()
})

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

// With a warehouse header: stock there. Without one (visitor hasn't given a CEP): stock in at least one warehouse.
const available = (p: Product, warehouse: string | undefined) =>
  warehouse ? inStock(p, warehouse) : Object.keys(warehouses).some((w) => inStock(p, w))

const card = (p: Product) => ({ id: p.id, name: p.name, brand: p.brand, image: p.images[0] })

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
    + `<rect width="100%" height="100%" fill="hsl(${hue} 12% 13%)"/>`
    + `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" `
    + `letter-spacing="2" font-size="${Math.round(Math.min(w, h) / 10)}" fill="hsl(${hue} 30% 66%)">${slug}</text></svg>`
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

  const cards = (ids: string[]) => ids.map((id) => card(products[id]))
  const blocks = pages[cid].map((block) => {
    if (block.type === 'shelf') {
      const { productIds, ...shelf } = block
      return { ...shelf, products: cards(productIds) }
    }
    if (block.type === 'tabbed-shelf') {
      return { ...block, tabs: block.tabs.map(({ productIds, ...tab }) => ({ ...tab, products: cards(productIds) })) }
    }
    return block
  })
  return c.json({ cid, blocks })
})

app.get('/product', (c) => {
  const id = c.req.query('id') ?? ''
  if (!Object.hasOwn(products, id)) return c.json({ error: 'product not found' }, 404)

  const { basePrice, listPrice, outOfStockIn, category, subcategory, ...product } = products[id]
  const ref = (id: string) => ({ id, name: categories[id].name })
  return c.json({ ...product, category: ref(category), subcategory: ref(subcategory) })
})

// Category tree for the storefront's menu: top-level categories with their subcategories.
app.get('/categories', (c) => {
  const all = Object.values(categories)
  const ref = ({ id, name }: { id: string; name: string }) => ({ id, name })
  return c.json({
    categories: all.filter((cat) => !cat.parent).map((cat) => ({ ...ref(cat), subcategories: all.filter((s) => s.parent === cat.id).map(ref) })),
  })
})

// Category listing: every product in the category or subcategory, content only (prices come from /prices).
app.get('/category', (c) => {
  const id = c.req.query('id') ?? ''
  if (!Object.hasOwn(categories, id)) return c.json({ error: 'category not found' }, 404)
  const { parent, ...category } = categories[id]
  const items = Object.values(products).filter((p) => p.category === id || p.subcategory === id)
  return c.json({
    ...category,
    ...(parent && { parent: { id: parent, name: categories[parent].name } }),
    products: items.map(card),
  })
})

// Accent- and case-insensitive, so "tenis" finds "Tênis".
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// shortcut: linear scan over the in-memory catalog; move to a search index when the catalog is real.
app.get('/search', (c) => {
  const q = (c.req.query('q') ?? '').trim()
  if (q.length < 2 || q.length > 50) return c.json({ error: 'q must have 2 to 50 characters' }, 400)
  const terms = fold(q).split(/\s+/)
  const results = Object.values(products).filter((p) => {
    const text = fold(`${p.name} ${p.brand} ${p.description}`)
    return terms.every((term) => text.includes(term))
  })
  return c.json({ q, products: results.map(card) })
})

// Batch prices and stock: /prices?ids=a,b,c with the warehouse header. Unknown ids are left out.
app.get('/prices', (c) => {
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const ids = (c.req.query('ids') ?? '').split(',').filter(Boolean)
  if (ids.length === 0 || ids.length > 100) return c.json({ error: 'ids must list 1 to 100 product ids' }, 400)

  const prices = Object.fromEntries(ids.filter((id) => Object.hasOwn(products, id)).map((id) => [
    id, { ...priced(products[id], warehouse), available: available(products[id], c.req.header('warehouse')) },
  ]))
  return c.json({ warehouse, prices })
})

// Basket routes are per customer (from the access token) and price items by the warehouse header.
app.get('/basket', async (c) => {
  const customerId = c.get('customerId')
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  return c.json(basketView(customerId, warehouse))
})

app.post('/add-item', async (c) => {
  const customerId = c.get('customerId')
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const { productId, quantity = 1 } = await body(c)
  if (typeof productId !== 'string' || !Object.hasOwn(products, productId)) {
    return c.json({ error: 'product not found' }, 404)
  }
  const requested = c.req.header('warehouse')
  if (!available(products[productId], requested)) {
    return c.json({ error: 'out of stock', code: 'out_of_stock' }, 409)
  }
  // No CEP yet: fine if every warehouse has it, otherwise the visitor must say where they are first.
  if (!requested && !Object.keys(warehouses).every((w) => inStock(products[productId], w))) {
    return c.json({ error: 'not in stock everywhere, set a location first', code: 'location_required' }, 409)
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
  const customerId = c.get('customerId')
  const warehouse = warehouseOf(c)
  if (!warehouse) return c.json({ error: 'unknown warehouse' }, 400)
  const { productId } = await body(c)
  if (typeof productId !== 'string') return c.json({ error: 'productId is required' }, 400)
  baskets.get(customerId)?.delete(productId)
  return c.json(basketView(customerId, warehouse))
})

// Favorites are per customer like the basket, but content only: the storefront prices them with /prices.
const favoritesView = (customerId: string) => ({ customerId, products: [...(favorites.get(customerId) ?? [])].map((id) => card(products[id])) })

app.get('/favorites', (c) => c.json(favoritesView(c.get('customerId'))))

app.post('/add-favorite', async (c) => {
  const customerId = c.get('customerId')
  const { productId } = await body(c)
  if (typeof productId !== 'string' || !Object.hasOwn(products, productId)) {
    return c.json({ error: 'product not found' }, 404)
  }
  favorites.set(customerId, (favorites.get(customerId) ?? new Set<string>()).add(productId))
  return c.json(favoritesView(customerId))
})

app.post('/delete-favorite', async (c) => {
  const customerId = c.get('customerId')
  const { productId } = await body(c)
  if (typeof productId !== 'string') return c.json({ error: 'productId is required' }, 400)
  favorites.get(customerId)?.delete(productId)
  return c.json(favoritesView(customerId))
})
