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
| GET | `/page?cid=home` | header `warehouse` | blocos CMS (`banner`, `shelf`) |
| GET | `/product?id=tenis-runner` | header `warehouse` | dados da PDP com preço do warehouse |

| GET | `/basket` | headers `authorization`, `warehouse` | itens, `subtotal` |
| POST | `/add-item` | `{ productId, quantity? }` + headers | cesta atualizada |
| POST | `/delete-item` | `{ productId }` + headers | cesta atualizada |

Sem header `warehouse` usa `br-01`; warehouse desconhecido → 400.
Rotas de cesta exigem `authorization: Bearer <accessToken>` (guest ou logado); máx. 99 unidades por item.
Usuário de teste: veja `apps/server/src/data.ts`.
