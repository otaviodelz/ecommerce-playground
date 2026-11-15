# ecommerce-playground

Monorepo (pnpm + Turborepo). `pnpm install`, então `pnpm dev` / `pnpm test` / `pnpm build`.

## apps/server

Hono em `http://localhost:3333` (`PORT`, `JWT_SECRET` via env). Preços em centavos.

| Método | Rota | Entrada | Saída |
|---|---|---|---|
| POST | `/guest-login` | — | `accessToken`, `refreshToken`, `customerId` |
| POST | `/login` | `{ email, password }` | tokens, `customerId`, `name`, `email` |
| POST | `/refresh-token` | `{ refreshToken }` | novos `accessToken`, `refreshToken`, `customerId` |
| POST | `/set-location` | `{ cep }` | `{ warehouse }` |
| GET | `/page?cid=home` | — | blocos CMS (`info-bar`, `banner`, `categories`, `shelf`, `benefits`), sem preço |
| GET | `/product?id=tenis-runner` | — | dados da PDP, sem preço |
| GET | `/prices?ids=a,b` | header `warehouse` | `{ warehouse, prices: { [id]: { price, listPrice } } }` |
| GET | `/basket` | headers `authorization`, `warehouse` | itens com preço, `subtotal` |
| POST | `/add-item` | `{ productId, quantity? }` + headers | cesta atualizada |
| POST | `/delete-item` | `{ productId }` + headers | cesta atualizada |
| GET | `/images/<slug>.svg?w=&h=` | — | placeholder SVG |

Conteúdo (`/page`, `/product`) é igual para todos; preço vem de `/prices` pelo warehouse.
Páginas CMS: `home`, `corrida`, `acessorios`, `eletronicos`. Banner com mais de um slide e vitrines viram carrossel no web.
Sem header `warehouse` usa `br-01`; warehouse desconhecido → 400.
Rotas de cesta exigem `authorization: Bearer <accessToken>` (guest ou logado); máx. 99 unidades por item.
Usuário de teste: veja `apps/server/src/data.ts`.

## apps/web

Next.js 16 em `http://localhost:3000` (`API_URL`, padrão `http://localhost:3333`), UI com [ui-sdk](https://ui-sdk.dev).

- Conteúdo do CMS e da PDP fica em cache (`"use cache"`, tag = path da API); a home sai no HTML estático.
  `/product/[id]` não é gerada no build: a casca é estática e o produto renderiza por requisição a partir do cache.
  Links antigos `/product?id=x` redirecionam (308) para `/product/x`.
  Só o preço é por visitante: `<Price>` em um `<Suspense>` pequeno, um lote de `/prices` por página, cache de minutos por warehouse.
- Revalidação: `POST /api/revalidate` com header `x-revalidate-secret: $REVALIDATE_SECRET` e `{ "tag": "/page?cid=home" }` (ou `/product?id=…`, `prices`).
- Sessão em cookies httpOnly; `proxy.ts` cria a sessão guest e renova o access token. Cesta e login são dinâmicos.
- **O build pré-gera a home, então precisa da API no ar** (`pnpm --filter server dev` antes de `pnpm build`).
