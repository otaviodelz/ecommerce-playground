import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decode } from 'hono/jwt'
import { app } from './app.js'

process.env.API_DELAY_MS = '0' // read per request, so the simulated latency stays out of the tests

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  app.request(path, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers } })

// Content and location routes need an access token too: one guest session for the tests that don't care whose it is.
const { accessToken: guestToken } = await (await post('/guest-login', {})).json()
const auth = { authorization: `Bearer ${guestToken}` }
const get = (path: string, headers: Record<string, string> = {}) => app.request(path, { headers: { ...auth, ...headers } })

test('every route needs an access token, except signing in and images', async () => {
  for (const path of ['/page?cid=home', '/categories', '/category?id=corrida', '/product?id=tenis-runner', '/search?q=tenis', '/prices?ids=tenis-runner', '/basket', '/favorites']) {
    assert.equal((await app.request(path)).status, 401, path)
    assert.equal((await app.request(path, { headers: { authorization: 'Bearer garbage' } })).status, 401, path)
    assert.equal((await get(path)).status, 200, path)
  }
  assert.equal((await post('/set-location', { cep: '01310-100' })).status, 401)
  assert.equal((await post('/add-item', { productId: 'tenis-runner' })).status, 401)
  assert.equal((await app.request('/images/tenis.svg')).status, 200)
})

test('the storefront origin may call the API from the browser', async () => {
  const res = await app.request('/prices?ids=tenis-runner', {
    method: 'OPTIONS',
    headers: { origin: 'http://localhost:3000', 'access-control-request-method': 'GET', 'access-control-request-headers': 'authorization,warehouse' },
  })
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000')
  assert.match(res.headers.get('access-control-allow-headers') ?? '', /authorization/)
})

test('images serves sized svg placeholders for safe slugs only', async () => {
  const res = await app.request('/images/hero.svg?w=1200&h=400')
  const svg = await res.text()
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('content-type'), 'image/svg+xml')
  assert.match(svg, /width="1200" height="400"/)
  assert.match(svg, />hero<\/text>/)
  assert.match(await (await app.request('/images/tenis.svg?w=99999')).text(), /width="2000" height="600"/)
  assert.equal((await app.request('/images/%3Cscript%3E.svg')).status, 404)
  assert.equal((await app.request('/images/tenis.png')).status, 404)
})

test('guest-login returns tokens and customerId', async () => {
  const res = await post('/guest-login', {})
  const json = await res.json()
  assert.equal(res.status, 200)
  assert.equal(decode(json.accessToken).payload.sub, json.customerId)
  assert.equal(decode(json.refreshToken).payload.type, 'refresh')
})

test('login validates credentials', async () => {
  const ok = await post('/login', { email: 'Maria@example.com', password: '123456' })
  const json = await ok.json()
  assert.equal(ok.status, 200)
  assert.deepEqual([json.customerId, json.name, json.email], ['cus_1', 'Maria Silva', 'maria@example.com'])
  assert.ok(json.accessToken && json.refreshToken)

  assert.equal((await post('/login', { email: 'maria@example.com', password: 'wrong' })).status, 401)
  assert.equal((await post('/login', { email: 'nobody@example.com', password: '123456' })).status, 401)
  assert.equal((await post('/login', {})).status, 400)
})

test('refresh-token issues new tokens only for a valid refresh token', async () => {
  const login = await (await post('/login', { email: 'maria@example.com', password: '123456' })).json()
  const res = await post('/refresh-token', { refreshToken: login.refreshToken })
  const json = await res.json()
  assert.equal(res.status, 200)
  assert.equal(json.customerId, 'cus_1')
  assert.equal(decode(json.accessToken).payload.type, 'access')
  assert.equal(decode(json.refreshToken).payload.guest, false)

  const guest = await (await post('/guest-login', {})).json()
  const guestRefreshed = await (await post('/refresh-token', { refreshToken: guest.refreshToken })).json()
  assert.equal(decode(guestRefreshed.accessToken).payload.guest, true)

  assert.equal((await post('/refresh-token', { refreshToken: login.accessToken })).status, 401)
  assert.equal((await post('/refresh-token', { refreshToken: 'garbage' })).status, 401)
  assert.equal((await post('/refresh-token', {})).status, 400)
})

test('set-location maps cep to warehouse', async () => {
  const wh = async (cep: unknown) => (await (await post('/set-location', { cep }, auth)).json()).warehouse
  assert.equal(await wh('01310-100'), 'sp-01')
  assert.equal(await wh('22041001'), 'rj-01')
  assert.equal(await wh('30130-010'), 'mg-01')
  assert.equal(await wh('69005-000'), 'br-01')
  assert.equal((await post('/set-location', { cep: '123' }, auth)).status, 400)
  assert.equal((await post('/set-location', { cep: 1310100 }, auth)).status, 400)
})

test('page and product return content without prices', async () => {
  const page = await (await get('/page?cid=home')).json()
  const shelf = page.blocks.find((b: any) => b.type === 'shelf')
  assert.deepEqual(page.blocks.map((b: any) => b.type), ['info-bar', 'hero', 'categories', 'shelf', 'benefits', 'banner', 'shelf'])
  assert.equal(page.blocks[1].slides.length, 3)
  assert.equal(page.blocks[1].actions[0].label, 'Ver ofertas')
  assert.deepEqual(shelf.products[0], { id: 'tenis-runner', name: 'Tênis Runner', brand: 'Acme', image: '/images/tenis.svg' })
  assert.equal((await get('/page?cid=nope')).status, 404)

  // every storefront link in the home resolves: /c/<category>, /product/<id> or /<cms page>
  const links = page.blocks.flatMap((b: any) => [
    b.link, ...(b.actions ?? []).map((a: any) => a.link), ...(b.items ?? []).map((i: any) => i.link), ...(b.slides ?? []).map((s: any) => s.link),
  ]).filter(Boolean)
  assert.ok(links.length >= 10)
  for (const link of links) {
    const [, kind, id] = link.match(/^\/(?:(c|product)\/)?([a-z0-9-]+)$/) ?? []
    assert.ok(id, `unexpected link format ${link}`)
    const api = kind === 'c' ? `/category?id=${id}` : kind === 'product' ? `/product?id=${id}` : `/page?cid=${id}`
    assert.equal((await get(api)).status, 200, link)
  }

  // CMS pages only list real products
  for (const cid of ['home', 'novidades', 'ofertas']) {
    for (const b of (await (await get(`/page?cid=${cid}`)).json()).blocks.filter((b: any) => b.type === 'shelf')) {
      for (const p of b.products) assert.ok(p.name && p.image, `${cid}/${b.id}`)
    }
  }

  const product = await (await get('/product?id=tenis-runner')).json()
  assert.equal(product.name, 'Tênis Runner')
  assert.deepEqual(product.category, { id: 'corrida', name: 'Corrida' })
  assert.deepEqual(product.subcategory, { id: 'tenis', name: 'Tênis' })
  assert.deepEqual([product.price, product.listPrice, product.basePrice, product.outOfStockIn], [undefined, undefined, undefined, undefined])
  assert.equal((await get('/product?id=nope')).status, 404)
})

test('category lists its products without prices', async () => {
  const res = await get('/category?id=eletronicos')
  const category = await res.json()
  assert.equal(res.status, 200)
  assert.equal(category.name, 'Eletrônicos')
  assert.deepEqual(category.products.map((p: any) => p.id), ['relogio-gps', 'fone-sport'])
  assert.equal(category.products[0].price, undefined)
  assert.equal((await get('/category?id=nope')).status, 404)
  assert.equal((await get('/category?id=toString')).status, 404)

  const roupas = await (await get('/category?id=roupas')).json()
  assert.deepEqual(roupas.parent, { id: 'corrida', name: 'Corrida' })
  assert.deepEqual(roupas.products.map((p: any) => p.id), ['camiseta-basic', 'bermuda-dry', 'jaqueta-corta-vento'])
  assert.equal((await (await get('/category?id=corrida')).json()).products.length, 5) // parent lists all its subcategories
})

test('categories returns the menu tree, and every product sits in a subcategory of its category', async () => {
  const { categories } = await (await get('/categories')).json()
  assert.deepEqual(categories.map((c: any) => c.id), ['corrida', 'acessorios', 'eletronicos'])
  assert.deepEqual(categories[0].subcategories, [{ id: 'tenis', name: 'Tênis' }, { id: 'roupas', name: 'Roupas' }, { id: 'meias', name: 'Meias' }])

  for (const id of ['tenis-runner', 'camiseta-basic', 'mochila-urban', 'garrafa-termica', 'bermuda-dry', 'meia-pro', 'bone-trail', 'jaqueta-corta-vento', 'relogio-gps', 'fone-sport']) {
    const p = await (await get(`/product?id=${id}`)).json()
    const parent = categories.find((c: any) => c.id === p.category.id)
    assert.ok(parent?.subcategories.some((s: any) => s.id === p.subcategory.id), id)
  }
})

test('search matches name, brand and description ignoring accents and case', async () => {
  const ids = async (q: string) => (await (await get(`/search?q=${encodeURIComponent(q)}`)).json()).products.map((p: any) => p.id)
  assert.deepEqual(await ids('tenis'), ['tenis-runner'])
  assert.deepEqual(await ids('PULSE'), ['relogio-gps', 'fone-sport'])
  assert.deepEqual(await ids('mochila notebook'), ['mochila-urban'])
  assert.deepEqual(await ids('nada-disso'), [])
  assert.equal((await get('/search?q=a')).status, 400)
  assert.equal((await get('/search')).status, 400)
  const first = (await (await get('/search?q=tenis')).json()).products[0]
  assert.equal(first.price, undefined)
})

test('prices change with warehouse, in batch', async () => {
  const prices = (ids: string, warehouse?: string) => get(`/prices?ids=${ids}`, warehouse ? { warehouse } : {})
  const sp = await (await prices('tenis-runner,camiseta-basic,nope', 'sp-01')).json()
  assert.equal(sp.warehouse, 'sp-01')
  assert.deepEqual(sp.prices, {
    'tenis-runner': { price: 29990, listPrice: 39990, available: true },
    'camiseta-basic': { price: 5990, listPrice: 7990, available: true },
  })
  const mg = await (await prices('tenis-runner', 'mg-01')).json()
  assert.deepEqual(mg.prices['tenis-runner'], { price: 32389, listPrice: 43189, available: true })
  assert.equal((await (await prices('tenis-runner')).json()).warehouse, 'br-01') // default warehouse

  assert.equal((await prices('tenis-runner', 'toString')).status, 400)
  assert.equal((await prices('')).status, 400)
  assert.equal((await prices(Array(101).fill('tenis-runner').join(','))).status, 400)
  assert.deepEqual((await (await prices('__proto__,constructor')).json()).prices, {})
})

test('stock depends on the warehouse; without one, add-item needs stock everywhere', async () => {
  const stock = async (warehouse?: string) => {
    const { prices } = await (await get('/prices?ids=tenis-runner,relogio-gps,fone-sport', warehouse ? { warehouse } : {})).json()
    return Object.fromEntries(Object.entries(prices).map(([id, p]: [string, any]) => [id, p.available]))
  }
  assert.deepEqual(await stock('sp-01'), { 'tenis-runner': true, 'relogio-gps': true, 'fone-sport': false })
  assert.deepEqual(await stock('mg-01'), { 'tenis-runner': true, 'relogio-gps': false, 'fone-sport': false })
  // no CEP yet: available if some warehouse has it, even though the default warehouse (br-01) has no relogio-gps
  assert.deepEqual(await stock(), { 'tenis-runner': true, 'relogio-gps': true, 'fone-sport': false })

  const { accessToken } = await (await post('/guest-login', {})).json()
  const add = (productId: string, warehouse?: string) =>
    app.request('/add-item', {
      method: 'POST',
      body: JSON.stringify({ productId }),
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', ...(warehouse ? { warehouse } : {}) },
    })
  const code = async (res: Promise<Response>) => { const r = await res; return [r.status, (await r.json()).code] }

  assert.deepEqual(await code(add('tenis-runner')), [200, undefined]) // in stock everywhere
  assert.deepEqual(await code(add('relogio-gps')), [409, 'location_required'])
  assert.deepEqual(await code(add('fone-sport')), [409, 'out_of_stock']) // no CEP would help
  assert.deepEqual(await code(add('relogio-gps', 'mg-01')), [409, 'out_of_stock'])
  assert.deepEqual(await code(add('relogio-gps', 'sp-01')), [200, undefined])
})

test('basket add/delete is per customer and priced by warehouse', async () => {
  const { accessToken, refreshToken } = await (await post('/guest-login', {})).json()
  const call = (path: string, body?: unknown, headers: Record<string, string> = {}) =>
    app.request(path, {
      method: body === undefined ? 'GET' : 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json', warehouse: 'sp-01', ...headers },
    })

  assert.deepEqual((await (await call('/basket')).json()).items, [])
  await call('/add-item', { productId: 'tenis-runner' })
  const added = await (await call('/add-item', { productId: 'tenis-runner', quantity: 2 })).json()
  assert.equal(added.items[0].quantity, 3)
  assert.equal(added.subtotal, 29990 * 3)

  const rj = await (await call('/basket', undefined, { warehouse: 'rj-01' })).json()
  assert.equal(rj.subtotal, 31490 * 3)

  await call('/add-item', { productId: 'camiseta-basic' })
  const afterDelete = await (await call('/delete-item', { productId: 'tenis-runner' })).json()
  assert.deepEqual(afterDelete.items.map((i: any) => i.id), ['camiseta-basic'])
  assert.equal(afterDelete.subtotal, 5990)

  // another customer sees an empty basket
  const other = await (await post('/guest-login', {})).json()
  const otherBasket = await (await call('/basket', undefined, { authorization: `Bearer ${other.accessToken}` })).json()
  assert.deepEqual(otherBasket.items, [])

  assert.equal((await call('/add-item', { productId: 'nope' })).status, 404)
  assert.equal((await call('/add-item', { productId: 'camiseta-basic', quantity: 0 })).status, 400)
  assert.equal((await call('/add-item', { productId: 'camiseta-basic', quantity: '2' })).status, 400)
  assert.equal((await call('/add-item', { productId: 'camiseta-basic', quantity: 99 })).status, 400) // over max
  assert.equal((await call('/delete-item', {})).status, 400)
  assert.equal((await call('/basket', undefined, { warehouse: 'toString' })).status, 400)
  assert.equal((await call('/basket', undefined, { authorization: '' })).status, 401)
  assert.equal((await call('/basket', undefined, { authorization: `Bearer ${refreshToken}` })).status, 401)
})

test('favorites add/delete is per customer, idempotent and without prices', async () => {
  const { accessToken } = await (await post('/guest-login', {})).json()
  const call = (path: string, body?: unknown, token = accessToken) =>
    app.request(path, {
      method: body === undefined ? 'GET' : 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    })
  const ids = async (res: Response | Promise<Response>) => (await (await res).json()).products.map((p: any) => p.id)

  assert.deepEqual(await ids(call('/favorites')), [])
  await call('/add-favorite', { productId: 'tenis-runner' })
  await call('/add-favorite', { productId: 'fone-sport' })
  assert.deepEqual(await ids(call('/add-favorite', { productId: 'tenis-runner' })), ['tenis-runner', 'fone-sport'])
  const [first] = (await (await call('/favorites')).json()).products
  assert.deepEqual(first, { id: 'tenis-runner', name: 'Tênis Runner', brand: 'Acme', image: '/images/tenis.svg' })

  assert.deepEqual(await ids(call('/delete-favorite', { productId: 'tenis-runner' })), ['fone-sport'])
  assert.deepEqual(await ids(call('/delete-favorite', { productId: 'tenis-runner' })), ['fone-sport'])

  const other = await (await post('/guest-login', {})).json()
  assert.deepEqual(await ids(call('/favorites', undefined, other.accessToken)), [])

  assert.equal((await call('/add-favorite', { productId: 'nope' })).status, 404)
  assert.equal((await call('/add-favorite', { productId: '__proto__' })).status, 404)
  assert.equal((await call('/delete-favorite', {})).status, 400)
  assert.equal((await call('/favorites', undefined, 'garbage')).status, 401)
})
