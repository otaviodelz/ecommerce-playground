import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decode } from 'hono/jwt'
import { app } from './app.js'

const post = (path: string, body: unknown) =>
  app.request(path, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })

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

test('page prices change with warehouse', async () => {
  const get = (warehouse: string) => app.request('/page?cid=home', { headers: { warehouse } })
  const sp = await (await get('sp-01')).json()
  const rj = await (await get('rj-01')).json()
  const spShelf = sp.blocks.find((b: any) => b.type === 'shelf')
  const rjShelf = rj.blocks.find((b: any) => b.type === 'shelf')
  assert.equal(spShelf.products[0].price, 29990)
  assert.equal(rjShelf.products[0].price, 31490)
  assert.equal(sp.blocks[0].type, 'banner')

  assert.equal((await get('toString')).status, 400)
  assert.equal((await app.request('/page?cid=nope')).status, 404)
  assert.equal((await app.request('/page?cid=home')).status, 200) // default warehouse
})

test('product prices change with warehouse', async () => {
  const get = (warehouse: string) => app.request('/product?id=tenis-runner', { headers: { warehouse } })
  const sp = await (await get('sp-01')).json()
  const mg = await (await get('mg-01')).json()
  assert.equal(sp.price, 29990)
  assert.equal(mg.price, 32389)
  assert.equal(mg.listPrice, 43189)
  assert.equal(sp.basePrice, undefined)
  assert.equal(sp.name, 'Tênis Runner')
  assert.equal((await app.request('/product?id=nope')).status, 404)
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
