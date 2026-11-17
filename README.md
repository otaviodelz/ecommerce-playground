# ecommerce-playground

Monorepo (pnpm + Turborepo). `pnpm install`, então `pnpm dev` / `pnpm test` / `pnpm build`.

## apps/server

Hono em `http://localhost:3333` (`PORT`, `JWT_SECRET`, `WEB_ORIGIN` via env). Preços em centavos.
Toda rota exige `authorization: Bearer <accessToken>` (guest ou logado), menos `/guest-login`, `/login`, `/refresh-token` e `/images/*` (o `<img>` não manda header); sem token → 401.
CORS liberado para `WEB_ORIGIN` (padrão `http://localhost:3000`), porque o browser chama a API direto.

| Método | Rota | Entrada | Saída |
|---|---|---|---|
| POST | `/guest-login` | — | `accessToken`, `refreshToken`, `customerId` |
| POST | `/login` | `{ email, password }` | tokens, `customerId`, `name`, `email` |
| POST | `/refresh-token` | `{ refreshToken }` | novos `accessToken`, `refreshToken`, `customerId` |
| POST | `/set-location` | `{ cep }` | `{ warehouse }` |
| GET | `/page?cid=home` | — | blocos CMS (`info-bar`, `hero`, `banner`, `cards`, `shortcuts`, `callout`, `categories`, `shelf`, `tabbed-shelf`, `benefits`), sem preço |
| GET | `/categories` | — | árvore do menu: categorias com `subcategories` |
| GET | `/category?id=corrida` | — | categoria ou subcategoria (`name`, `description`, `parent?`) e seus produtos, sem preço |
| GET | `/search?q=tenis` | — | produtos que batem com nome, marca ou descrição (sem acento/caixa), sem preço |
| GET | `/product?id=tenis-runner` | — | dados da PDP, sem preço |
| GET | `/prices?ids=a,b` | header `warehouse` | `{ warehouse, prices: { [id]: { price, listPrice, available } } }` |
| GET | `/basket` | headers `authorization`, `warehouse` | itens com preço, `subtotal` |
| POST | `/add-item` | `{ productId, quantity? }` + headers | cesta atualizada |
| POST | `/delete-item` | `{ productId }` + headers | cesta atualizada |
| GET | `/favorites` | header `authorization` | `{ products }` favoritados, sem preço |
| POST | `/add-favorite` | `{ productId }` + header | favoritos atualizados (repetir não duplica) |
| POST | `/delete-favorite` | `{ productId }` + header | favoritos atualizados |
| GET | `/images/<slug>.svg?w=&h=` | — | placeholder SVG |

Conteúdo (`/page`, `/product`) é igual para todos; preço vem de `/prices` pelo warehouse.
Páginas CMS: `home`, `novidades`, `ofertas`. Categorias: `corrida`, `acessorios`, `eletronicos`, cada uma com subcategorias (ex. `tenis`, `roupas`, `meias`); cada produto tem uma categoria e uma subcategoria. Banner com mais de um slide, vitrines e fileiras de cards viram carrossel no web; `tabbed-shelf` é um banner ao lado de uma vitrine com abas.
A home segue o ritmo de blocos de um grande varejista: hero, cards de oferta, atalhos, aviso, categorias e vitrines alternadas com fileiras de cards (13 blocos).
Sem header `warehouse` usa `br-01`; warehouse desconhecido → 400.
Cesta e favoritos são do cliente dono do token; máx. 99 unidades por item.
Estoque por warehouse (`outOfStockIn` em `data.ts`): `available` é o estoque no warehouse do header ou, sem header, em pelo menos um.
`/add-item` responde 409 `out_of_stock`, ou 409 `location_required` quando não há header e o produto falta em algum warehouse.
Usuário de teste: veja `apps/server/src/data.ts`.

## apps/web

Next.js 16 em `http://localhost:3000` (`API_URL` para o servidor e `NEXT_PUBLIC_API_URL` para o browser, padrão `http://localhost:3333`; `SITE_URL` é o endereço público, usado em canonical, Open Graph e JSON-LD), UI com [ui-sdk](https://ui-sdk.dev).

- Pastas: `app/` só rotas; `components/` (`layout/` header e barra de categorias, `product/` card, oferta, cesta, favorito e listas, `cms/` blocos, vitrine e banner, `forms.tsx`, `basket-items.tsx`, `providers.tsx`); `lib/` (`api.ts` conteúdo no servidor, `client/` sessão, API, localização e queries no browser, `format.ts`, `token.ts`, `config.ts`). Testes ficam ao lado do código.
- Dois caminhos de dados:
  - **Conteúdo** (home, páginas CMS, categorias, PDP, menu): buscado no servidor por `getContent`, com um token guest do próprio servidor (o build não tem visitante), em cache e no HTML estático.
  - **Por visitante** (preço e estoque, cesta, favoritos, busca, CEP, nome): buscado no browser com [TanStack Query](https://tanstack.com/query), direto na API.
- Sessão: o refresh token fica num cookie httpOnly; o access token fica só em memória (`lib/client/session.ts`).
  `POST /api/session` troca o refresh token por um access token novo (ou abre uma sessão guest); com `{ email, password }` faz o login.
  O client renova 30s antes de expirar e, num 401, renova e repete uma vez.
- CEP e warehouse ficam no `localStorage`; trocar o CEP muda a chave das queries de preço e cesta, que buscam de novo.
- Páginas: `/` (CMS home), `/[cid]` (páginas CMS, ex. `/ofertas`), `/c/[id]` (categorias), `/product/[id]`, `/search?q=`, `/basket`, `/favorites`, `/login`.
  Cada card tem um coração (favoritar); o estado vem de uma query de favoritos compartilhada, como o preço.
  Links antigos `/page?cid=x` redirecionam (308) para `/x`, ou `/c/x` se `x` virou categoria.
- Tema "terminal" (escuro fixo, cantos retos, títulos mono) pelos tokens `--ui-*` em `app/globals.css`.
  Header: busca (atalho `/`), CEP num popover, conta e cesta com contador; barra de categorias abaixo.
  A barra vem de `/categories` (cacheada, no HTML estático) e é um Navigation Menu do ui-sdk: hover, clique ou teclado abrem as subcategorias.

- Conteúdo do CMS e da PDP fica em cache (`"use cache"`, tag = path da API); a home sai no HTML estático.
  ISR com Cache Components: o build gera todas as categorias (`/c/[id]`) e um produto (`tenis-runner`, o mínimo exigido).
  Os outros produtos recebem o fallback só na primeira visita; o Next gera a página em segundo plano e serve completa daí em diante.
  Links para categoria usam `prefetch` completo, senão a navegação busca só a casca e mostra o fallback.
  Links para produto usam o prefetch padrão (só a casca), para não gerar uma requisição ao servidor por card visível; ao abrir um produto aparece o fallback até a página chegar.
  Links antigos `/product?id=x` redirecionam (308) para `/product/x`.
  Preço, estoque e botão carregam no browser: cada `<Offer>` faz sua própria query (`/prices?ids=<id>`) por produto e warehouse, só quando entra no viewport (slides escondidos do carrossel contam como fora); o mesmo produto em duas vitrines divide a query.
  Sem estoque o botão vira "Indisponível"; sem CEP e com o produto faltando em alguma região, "Adicionar" abre um modal de CEP e adiciona em seguida.
- SEO: PDP e categoria têm título, descrição, canonical e Open Graph próprios (`generateMetadata`).
  A PDP leva no HTML um JSON-LD `Product` + `Offer` e as tags `og:type=product` / `product:price:*` com o preço de quem não informou CEP (warehouse padrão), o mesmo que um crawler vê.
  Esse preço fica em cache de minutos no servidor, então a PDP revalida a cada minuto; o preço visível continua vindo do browser, pelo CEP do visitante, e na PDP é buscado sem esperar o viewport.
- Revalidação: `POST /api/revalidate` com header `x-revalidate-secret: $REVALIDATE_SECRET` e `{ "tag": "/page?cid=home" }` (ou `/product?id=…`, `/category?id=…`, `/categories`, `/prices?ids=…` para o preço de um produto no HTML, `prices` para todos).
  Os preços visíveis não passam pelo cache do Next: o react-query os mantém por 30s no browser.
- **O build pré-gera a home, então precisa da API no ar** (`pnpm --filter server dev` antes de `pnpm build`).
  O conteúdo buscado fica em `apps/web/.next/cache/fetch-cache` e o build seguinte reaproveita por até 1h: depois de mudar o conteúdo da API, apague essa pasta (ou chame o webhook de revalidação) antes de buildar.
