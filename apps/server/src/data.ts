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
    images: ['https://picsum.photos/seed/tenis/600'],
    basePrice: 29990, listPrice: 39990, specs: { Material: 'Mesh', Peso: '240g' },
  },
  'camiseta-basic': {
    id: 'camiseta-basic', name: 'Camiseta Basic', brand: 'Acme',
    description: 'Camiseta 100% algodão.',
    images: ['https://picsum.photos/seed/camiseta/600'],
    basePrice: 5990, listPrice: 7990, specs: { Material: 'Algodão' },
  },
  'mochila-urban': {
    id: 'mochila-urban', name: 'Mochila Urban', brand: 'Trail',
    description: 'Mochila 20L com compartimento para notebook.',
    images: ['https://picsum.photos/seed/mochila/600'],
    basePrice: 18990, listPrice: 18990, specs: { Capacidade: '20L' },
  },
  'garrafa-termica': {
    id: 'garrafa-termica', name: 'Garrafa Térmica', brand: 'Trail',
    description: 'Mantém a temperatura por 12h.',
    images: ['https://picsum.photos/seed/garrafa/600'],
    basePrice: 8990, listPrice: 9990, specs: { Volume: '750ml' },
  },
}

export type Block =
  | { type: 'banner'; id: string; image: string; link: string }
  | { type: 'shelf'; id: string; title: string; productIds: string[] }

export const pages: Record<string, Block[]> = {
  home: [
    { type: 'banner', id: 'hero', image: 'https://picsum.photos/seed/hero/1200/400', link: '/product?id=tenis-runner' },
    { type: 'shelf', id: 'best-sellers', title: 'Mais vendidos', productIds: ['tenis-runner', 'camiseta-basic', 'mochila-urban'] },
    { type: 'banner', id: 'promo', image: 'https://picsum.photos/seed/promo/1200/300', link: '/page?cid=home' },
    { type: 'shelf', id: 'new', title: 'Novidades', productIds: ['garrafa-termica', 'mochila-urban'] },
  ],
}
