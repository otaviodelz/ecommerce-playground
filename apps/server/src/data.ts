// shortcut: in-memory mock data, swap for a real DB/CMS when one exists.
import { hashPassword } from './auth.js'

export const DEFAULT_WAREHOUSE = 'br-01'

export const warehouses: Record<string, { name: string; priceFactor: number }> = {
  'sp-01': { name: 'São Paulo', priceFactor: 1 },
  'rj-01': { name: 'Rio de Janeiro', priceFactor: 1.05 },
  'mg-01': { name: 'Belo Horizonte', priceFactor: 1.08 },
  'br-01': { name: 'Nacional', priceFactor: 1.15 },
}

// CEP ranges by state (Correios): SP 01000-19999, RJ 20000-28999, MG 30000-39999.
const cepRanges: [number, number, string][] = [
  [1000000, 19999999, 'sp-01'],
  [20000000, 28999999, 'rj-01'],
  [30000000, 39999999, 'mg-01'],
]

export function warehouseForCep(cep: string) {
  const n = Number(cep)
  return cepRanges.find(([min, max]) => n >= min && n <= max)?.[2] ?? DEFAULT_WAREHOUSE
}

// Test user for /login: maria@example.com / 123456
export const users = [
  { id: 'cus_1', name: 'Maria Silva', email: 'maria@example.com', passwordHash: hashPassword('123456') },
]

export type Product = {
  id: string
  name: string
  brand: string
  description: string
  images: string[]
  basePrice: number // cents, before warehouse factor
  listPrice: number // cents, "de" price
  specs: Record<string, string>
}

export const products: Record<string, Product> = {
  'tenis-runner': {
    id: 'tenis-runner', name: 'Tênis Runner', brand: 'Acme',
    description: 'Tênis leve para corrida.',
    images: ['/images/tenis.svg'],
    basePrice: 29990, listPrice: 39990, specs: { Material: 'Mesh', Peso: '240g' },
  },
  'camiseta-basic': {
    id: 'camiseta-basic', name: 'Camiseta Basic', brand: 'Acme',
    description: 'Camiseta 100% algodão.',
    images: ['/images/camiseta.svg'],
    basePrice: 5990, listPrice: 7990, specs: { Material: 'Algodão' },
  },
  'mochila-urban': {
    id: 'mochila-urban', name: 'Mochila Urban', brand: 'Trail',
    description: 'Mochila 20L com compartimento para notebook.',
    images: ['/images/mochila.svg'],
    basePrice: 18990, listPrice: 18990, specs: { Capacidade: '20L' },
  },
  'garrafa-termica': {
    id: 'garrafa-termica', name: 'Garrafa Térmica', brand: 'Trail',
    description: 'Mantém a temperatura por 12h.',
    images: ['/images/garrafa.svg'],
    basePrice: 8990, listPrice: 9990, specs: { Volume: '750ml' },
  },
  'bermuda-dry': {
    id: 'bermuda-dry', name: 'Bermuda Dry', brand: 'Acme',
    description: 'Bermuda de secagem rápida com bolso traseiro.',
    images: ['/images/bermuda.svg'],
    basePrice: 7990, listPrice: 9990, specs: { Material: 'Poliéster' },
  },
  'meia-pro': {
    id: 'meia-pro', name: 'Meia Pro', brand: 'Acme',
    description: 'Meia de compressão leve, kit com 3 pares.',
    images: ['/images/meia.svg'],
    basePrice: 2990, listPrice: 3990, specs: { Pares: '3' },
  },
  'bone-trail': {
    id: 'bone-trail', name: 'Boné Trail', brand: 'Trail',
    description: 'Boné com proteção UV e ajuste traseiro.',
    images: ['/images/bone.svg'],
    basePrice: 6990, listPrice: 6990, specs: { Proteção: 'UV50+' },
  },
  'jaqueta-corta-vento': {
    id: 'jaqueta-corta-vento', name: 'Jaqueta Corta-Vento', brand: 'Trail',
    description: 'Jaqueta leve e compactável, resistente à garoa.',
    images: ['/images/jaqueta.svg'],
    basePrice: 24990, listPrice: 29990, specs: { Peso: '180g' },
  },
  'relogio-gps': {
    id: 'relogio-gps', name: 'Relógio GPS', brand: 'Pulse',
    description: 'GPS, frequência cardíaca e 7 dias de bateria.',
    images: ['/images/relogio.svg'],
    basePrice: 89990, listPrice: 99990, specs: { Bateria: '7 dias', 'À prova d\'água': '5 ATM' },
  },
  'fone-sport': {
    id: 'fone-sport', name: 'Fone Sport', brand: 'Pulse',
    description: 'Fone sem fio resistente ao suor.',
    images: ['/images/fone.svg'],
    basePrice: 19990, listPrice: 24990, specs: { Bateria: '8h' },
  },
}

// customerId -> (productId -> quantity). Prices are applied at read time from the warehouse header.
export const baskets = new Map<string, Map<string, number>>()
export const MAX_ITEM_QUANTITY = 99

type Slide = { image: string; link: string; alt: string }

// A banner with more than one slide is shown as a carousel; shelves always are.
export type Block =
  | { type: 'hero'; id: string; title: string; text: string; actions: { label: string; link: string }[]; slides: Slide[] }
  | { type: 'banner'; id: string; slides: Slide[] }
  | { type: 'shelf'; id: string; title: string; productIds: string[] }
  | { type: 'info-bar'; id: string; text: string; link?: string }
  | { type: 'categories'; id: string; title: string; items: { label: string; description: string; link: string }[] }
  | { type: 'benefits'; id: string; items: { title: string; description: string }[] }

const slide = (slug: string, link: string, alt: string, h = 400) => ({ image: `/images/${slug}.svg?w=1200&h=${h}`, link, alt })
const shelf = (id: string, title: string, productIds: string[]): Block => ({ type: 'shelf', id, title, productIds })

export const pages: Record<string, Block[]> = {
  home: [
    { type: 'info-bar', id: 'shipping', text: 'Frete grátis nas compras acima de R$ 199', link: '/page?cid=corrida' },
    {
      type: 'hero', id: 'hero',
      title: 'Equipamento para quem treina de verdade',
      text: 'Tênis, relógios e acessórios com o preço do seu estoque mais próximo. Troca em 30 dias.',
      actions: [{ label: 'Ver ofertas', link: '/page?cid=ofertas' }, { label: 'Corrida', link: '/page?cid=corrida' }],
      slides: [
        slide('hero-corrida', '/product/tenis-runner', 'Tênis Runner com até 25% off', 900),
        slide('hero-relogio', '/product/relogio-gps', 'Relógio GPS: treine com dados', 900),
        slide('hero-inverno', '/product/jaqueta-corta-vento', 'Coleção corta-vento', 900),
      ],
    },
    {
      type: 'categories', id: 'departments', title: 'Categorias', items: [
        { label: 'Corrida', description: 'Tênis, bermudas e meias', link: '/page?cid=corrida' },
        { label: 'Acessórios', description: 'Mochilas, bonés e garrafas', link: '/page?cid=acessorios' },
        { label: 'Eletrônicos', description: 'Relógios e fones', link: '/page?cid=eletronicos' },
        { label: 'Ofertas', description: 'Até 25% off', link: '/page?cid=ofertas' },
      ],
    },
    shelf('best-sellers', 'Mais vendidos', ['tenis-runner', 'camiseta-basic', 'mochila-urban', 'relogio-gps', 'bermuda-dry', 'fone-sport']),
    {
      type: 'benefits', id: 'benefits', items: [
        { title: 'Frete grátis', description: 'Acima de R$ 199 para todo o Brasil' },
        { title: 'Troca fácil', description: '30 dias para trocar ou devolver' },
        { title: 'Até 10x sem juros', description: 'No cartão de crédito' },
      ],
    },
    { type: 'banner', id: 'promo', slides: [slide('promo', '/page?cid=acessorios', 'Acessórios a partir de R$ 29,90', 300)] },
    shelf('new', 'Novidades', ['jaqueta-corta-vento', 'garrafa-termica', 'bone-trail', 'meia-pro', 'mochila-urban']),
  ],
  corrida: [shelf('running', 'Corrida', ['tenis-runner', 'bermuda-dry', 'meia-pro', 'camiseta-basic', 'jaqueta-corta-vento'])],
  acessorios: [shelf('accessories', 'Acessórios', ['mochila-urban', 'garrafa-termica', 'bone-trail', 'meia-pro'])],
  eletronicos: [shelf('electronics', 'Eletrônicos', ['relogio-gps', 'fone-sport'])],
  novidades: [shelf('new-arrivals', 'Novidades', ['jaqueta-corta-vento', 'garrafa-termica', 'bone-trail', 'meia-pro', 'mochila-urban'])],
  ofertas: [shelf('deals', 'Ofertas', Object.values(products).filter((p) => p.listPrice > p.basePrice).map((p) => p.id))],
}
