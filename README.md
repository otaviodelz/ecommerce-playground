# ecommerce-playground

Monorepo (pnpm + Turborepo) em arquitetura **Multi-Zones (Vertical Split)** com Next.js 16 App Router e governança completa por squads independentes. `pnpm install`, então `pnpm dev` / `pnpm test` / `pnpm typecheck` / `pnpm build` / `pnpm start` / `pnpm stop` (`dev` e `start` liberam automaticamente as portas `3333` e `3000–3003` antes de subir e encerram toda a árvore de processos ao sair).

## Arquitetura Multi-Zones

Todas as zonas rodam sob o mesmo domínio público (`SITE_URL`, padrão `http://localhost:3000`). A zona primária (`apps/discovery`) faz roteamento via `beforeFiles` rewrites para as demais zonas e para `/images/*` (em produção, essas mesmas regras de `@playground/platform/zones` sobem para CDN/Edge).

| App | Squad | Porta | `assetPrefix` | Rotas |
|---|---|---|---|---|
| `apps/discovery` (`@playground/discovery`) | Home e Busca | `3000` | — *(zona primária/fallback)* | `/`, `/[cid]`, `/c/[id]`, `/search`, `/page`, `/api/revalidate` (fan-out) |
| `apps/pdp` (`@playground/pdp`) | PDP | `3001` | `/_pdp` | `/product/[id]`, `/product`, `/api/revalidate` |
| `apps/cart-auth` (`@playground/cart-auth`) | Login e Sacola | `3002` | `/_cart` | `/basket`, `/login`, `/api/session`, `/api/revalidate` |
| `apps/account` (`@playground/account`) | Pós-Compra | `3003` | `/_account` | `/favorites`, `/api/revalidate` |
| `apps/server` | API Mock | `3333` | — | API Hono (catálogo, CMS, preços, cesta, favoritos, auth) |
| `apps/storybook` (`@playground/storybook`) | Platform / DS | `6006` | — | Documentação isolada do Design System |

### Pacotes compartilhados e governança por squad (`packages/*` + `.github/CODEOWNERS`)

| Pacote | Squad Dona | Responsabilidade |
|---|---|---|
| `@playground/design-system` | Platform / DS | Tokens `--ds-*` / `--ui-*`, tema Tailwind v4 e primitivas acessíveis (`@ui-sdk/react`) |
| `@playground/platform` | Platform | Registro de zonas, navegação (`ServerZoneLink`, `ZoneLink`, `ZoneForm`), `getContent`, `clientApi`, sessão (`getSession`), `Providers` (cache `sessionStorage` 30s), i18n, revalidação fan-out |
| `@playground/shipping` | Entrega | `location` (CEP/warehouse), `CepForm`, `CepPopover` |
| `@playground/cart` | Login e Sacola | `useAccountName`, `useBasket`, `useAddToBasket`, `AddToBasket` *(enquanto `deleteItem`, `signIn` e `LoginForm` ficam locais em `apps/cart-auth`)* |
| `@playground/favorites` | Pós-Compra | `useFavorites`, `useSetFavorite`, `Favorite` / `FavoriteToggle` |
| `@playground/catalog` | PDP | `usePrice`, `Offer`, `ProductCard` *(não consumido por `apps/cart-auth`, isolando o cache de build)* |
| `@playground/shell` | Platform | `StorefrontLayout`, `Header` (compõe slots das squads), `CategoryBar`, `Footer` |

## apps/server

Hono em `http://localhost:3333` (`PORT`, `JWT_SECRET`, `WEB_ORIGIN` via env). Preços em centavos.
Toda rota exige `authorization: Bearer <accessToken>` (guest ou logado), menos `/guest-login`, `/login`, `/refresh-token` e `/images/*` (o `<img>` não manda header); sem token → 401.
CORS liberado para `WEB_ORIGIN` (padrão `http://localhost:3000`), porque o browser chama a API direto a partir do domínio unificado do storefront.

Usuário de teste: veja `apps/server/src/data.ts`.

## Performance, SEO & Cache nas Zonas

- **Navegação zone-aware**: links intra-zona usam `next/link` (soft navigation + `partialPrefetching`); links cross-zone no servidor usam `ServerZoneLink` (`<a>` puro sem fronteira client) combinados com **Speculation Rules** (`eagerness: "moderate"`), `@view-transition { navigation: auto; }` e espelhamento curto em `sessionStorage` (30s) com batching via `queueMicrotask`.
- **LCP & imagens**: `fetchPriority="high"` apenas no 1º slide do Hero, foto principal da PDP e 1º card de categoria/busca; `loading="lazy"` + `decoding="async"` nas demais imagens.
- **Sessão centralizada**: `/api/session` vive em `apps/cart-auth` (exposto no domínio raiz via rewrite), mantendo o refresh token em cookie `httpOnly` (`path: "/"`) compartilhado entre todas as zonas e o access token apenas em memória.
- **SEO**: `apps/discovery` (CMS e categorias) e `apps/pdp` (PDP com JSON-LD `Product`/`Offer`, `og:type=product` e `getDefaultOffer` local em `apps/pdp/lib/pricing.ts`) preservam canonical, Open Graph e HTML estático/ISR no mesmo domínio. Páginas transacionais (`/basket`, `/login`, `/favorites`) marcam `robots: noindex, nofollow`.
- **Revalidação com fan-out**: `POST /api/revalidate` em `apps/discovery` (com `x-revalidate-secret: $REVALIDATE_SECRET`) invalida localmente e propaga automaticamente para as zonas afetadas (`/categories` → todas as zonas; `prices` / `/product?id=...` → `apps/pdp`; `/page?cid=...` / `/category?id=...` → `apps/discovery`).
- **Build orquestrado**: `pnpm build` (via `scripts/build.mjs`) compila `server` e `packages/*`, sobe a API local se necessário, executa o build de todas as 4 zonas e encerra o servidor ao final.
