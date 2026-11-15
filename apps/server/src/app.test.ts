import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decode } from 'hono/jwt'
import { app } from './app.js'

const post = (path: string, body: unknown) =>
  app.request(path, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })

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
  const wh = async (cep: unknown) => (await (await post('/set-location', { cep })).json()).warehouse
  assert.equal(await wh('01310-100'), 'sp-01')
  assert.equal(await wh('22041001'), 'rj-01')
  assert.equal(await wh('30130-010'), 'mg-01')
  assert.equal(await wh('69005-000'), 'br-01')
  assert.equal((await post('/set-location', { cep: '123' })).status, 400)
  assert.equal((await post('/set-location', { cep: 1310100 })).status, 400)
})

test('page and product return content without prices', async () => {
  const page = await (await app.request('/page?cid=home')).json()
  const shelf = page.blocks.find((b: any) => b.type === 'shelf')
  assert.deepEqual(page.blocks.map((b: any) => b.type), ['info-bar', 'banner', 'categories', 'shelf', 'benefits', 'banner', 'shelf'])
  assert.equal(page.blocks[1].slides.length, 3)
  assert.deepEqual(shelf.products[0], { id: 'tenis-runner', name: 'Tênis Runner', brand: 'Acme', image: '/images/tenis.svg' })
  assert.equal((await app.request('/page?cid=nope')).status, 404)

  // every category the home links to is a page, and every shelf lists real products
  const categories = page.blocks.find((b: any) => b.type === 'categories').items
  for (const cid of ['home', ...categories.map((c: any) => new URLSearchParams(c.link.split('?')[1]).get('cid'))]) {
    const res = await app.request(`/page?cid=${cid}`)
    assert.equal(res.status, 200, cid)
    for (const b of (await res.json()).blocks.filter((b: any) => b.type === 'shelf')) {
      for (const p of b.products) assert.ok(p.name && p.image, `${cid}/${b.id}`)
    }
  }

  const product = await (await app.request('/product?id=tenis-runner')).json()
  assert.equal(product.name, 'Tênis Runner')
  assert.deepEqual([product.price, product.listPrice, product.basePrice], [undefined, undefined, undefined])
  assert.equal((await app.request('/product?id=nope')).status, 404)
})

test('prices change with warehouse, in batch', async () => {
  const get = (ids: string, warehouse?: string) =>
    app.request(`/prices?ids=${ids}`, { headers: warehouse ? { warehouse } : {} })
  const sp = await (await get('tenis-runner,camiseta-basic,nope', 'sp-01')).json()
  assert.equal(sp.warehouse, 'sp-01')
  assert.deepEqual(sp.prices, {
    'tenis-runner': { price: 29990, listPrice: 39990 },
    'camiseta-basic': { price: 5990, listPrice: 7990 },
  })
  const mg = await (await get('tenis-runner', 'mg-01')).json()
  assert.deepEqual(mg.prices['tenis-runner'], { price: 32389, listPrice: 43189 })
  assert.equal((await (await get('tenis-runner')).json()).warehouse, 'br-01') // default warehouse

  assert.equal((await get('tenis-runner', 'toString')).status, 400)
  assert.equal((await get('')).status, 400)
  assert.equal((await get(Array(101).fill('tenis-runner').join(','))).status, 400)
  assert.deepEqual((await (await get('__proto__,constructor')).json()).prices, {})
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
