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

// Top-level categories and their subcategories (with `parent`), one id space so /c/<id> serves both.
export const categories: Record<string, { id: string; name: string; description: string; parent?: string }> = {
  corrida: { id: 'corrida', name: 'Corrida', description: 'Tênis, bermudas, meias e jaquetas para treinar.' },
  acessorios: { id: 'acessorios', name: 'Acessórios', description: 'Mochilas, bonés e garrafas para o dia a dia.' },
  eletronicos: { id: 'eletronicos', name: 'Eletrônicos', description: 'Relógios e fones para medir e embalar o treino.' },
  tenis: { id: 'tenis', name: 'Tênis', description: 'Tênis leves para treino e prova.', parent: 'corrida' },
  roupas: { id: 'roupas', name: 'Roupas', description: 'Camisetas, bermudas e jaquetas de secagem rápida.', parent: 'corrida' },
  meias: { id: 'meias', name: 'Meias', description: 'Meias de compressão e cano curto.', parent: 'corrida' },
  mochilas: { id: 'mochilas', name: 'Mochilas', description: 'Mochilas para o dia a dia e o trabalho.', parent: 'acessorios' },
  garrafas: { id: 'garrafas', name: 'Garrafas', description: 'Garrafas térmicas e squeezes.', parent: 'acessorios' },
  bones: { id: 'bones', name: 'Bonés', description: 'Bonés com proteção UV.', parent: 'acessorios' },
  relogios: { id: 'relogios', name: 'Relógios', description: 'Relógios com GPS e frequência cardíaca.', parent: 'eletronicos' },
  fones: { id: 'fones', name: 'Fones', description: 'Fones sem fio para treinar.', parent: 'eletronicos' },
}

export type Product = {
  id: string
  name: string
  brand: string
  category: keyof typeof categories // top-level
  subcategory: keyof typeof categories
  description: string
  images: string[]
  basePrice: number // cents, before warehouse factor
  listPrice: number // cents, "de" price
  specs: Record<string, string>
  outOfStockIn?: string[] // warehouse ids with no stock; in stock everywhere else
}

// shortcut: stock is a yes/no per warehouse, not a quantity, so add-item doesn't cap at what's on the shelf; model counts when stock is real.
export const inStock = (p: Product, warehouse: string) => !p.outOfStockIn?.includes(warehouse)

export const products: Record<string, Product> = {
  'tenis-runner': {
    id: 'tenis-runner', name: 'Tênis Runner', brand: 'Acme', category: 'corrida', subcategory: 'tenis',
    description: 'Tênis leve para corrida.',
    images: ['/images/tenis.svg'],
    basePrice: 29990, listPrice: 39990, specs: { Material: 'Mesh', Peso: '240g' },
  },
  'camiseta-basic': {
    id: 'camiseta-basic', name: 'Camiseta Basic', brand: 'Acme', category: 'corrida', subcategory: 'roupas',
    description: 'Camiseta 100% algodão.',
    images: ['/images/camiseta.svg'],
    basePrice: 5990, listPrice: 7990, specs: { Material: 'Algodão' },
  },
  'mochila-urban': {
    id: 'mochila-urban', name: 'Mochila Urban', brand: 'Trail', category: 'acessorios', subcategory: 'mochilas',
    description: 'Mochila 20L com compartimento para notebook.',
    images: ['/images/mochila.svg'],
    basePrice: 18990, listPrice: 18990, specs: { Capacidade: '20L' },
  },
  'garrafa-termica': {
    id: 'garrafa-termica', name: 'Garrafa Térmica', brand: 'Trail', category: 'acessorios', subcategory: 'garrafas',
    description: 'Mantém a temperatura por 12h.',
    images: ['/images/garrafa.svg'],
    basePrice: 8990, listPrice: 9990, specs: { Volume: '750ml' },
  },
  'bermuda-dry': {
    id: 'bermuda-dry', name: 'Bermuda Dry', brand: 'Acme', category: 'corrida', subcategory: 'roupas',
    description: 'Bermuda de secagem rápida com bolso traseiro.',
    images: ['/images/bermuda.svg'],
    basePrice: 7990, listPrice: 9990, specs: { Material: 'Poliéster' },
  },
  'meia-pro': {
    id: 'meia-pro', name: 'Meia Pro', brand: 'Acme', category: 'corrida', subcategory: 'meias',
    description: 'Meia de compressão leve, kit com 3 pares.',
    images: ['/images/meia.svg'],
    basePrice: 2990, listPrice: 3990, specs: { Pares: '3' },
  },
  'bone-trail': {
    id: 'bone-trail', name: 'Boné Trail', brand: 'Trail', category: 'acessorios', subcategory: 'bones',
    description: 'Boné com proteção UV e ajuste traseiro.',
    images: ['/images/bone.svg'],
    basePrice: 6990, listPrice: 6990, specs: { Proteção: 'UV50+' },
  },
  'jaqueta-corta-vento': {
    id: 'jaqueta-corta-vento', name: 'Jaqueta Corta-Vento', brand: 'Trail', category: 'corrida', subcategory: 'roupas',
    description: 'Jaqueta leve e compactável, resistente à garoa.',
    images: ['/images/jaqueta.svg'],
    basePrice: 24990, listPrice: 29990, specs: { Peso: '180g' }, outOfStockIn: ['rj-01'],
  },
  'relogio-gps': {
    id: 'relogio-gps', name: 'Relógio GPS', brand: 'Pulse', category: 'eletronicos', subcategory: 'relogios',
    description: 'GPS, frequência cardíaca e 7 dias de bateria.',
    images: ['/images/relogio.svg'],
    basePrice: 89990, listPrice: 99990, specs: { Bateria: '7 dias', 'À prova d\'água': '5 ATM' }, outOfStockIn: ['mg-01', 'br-01'],
  },
  'fone-sport': {
    id: 'fone-sport', name: 'Fone Sport', brand: 'Pulse', category: 'eletronicos', subcategory: 'fones',
    description: 'Fone sem fio resistente ao suor.',
    images: ['/images/fone.svg'],
    basePrice: 19990, listPrice: 24990, specs: { Bateria: '8h' }, outOfStockIn: ['sp-01', 'rj-01', 'mg-01', 'br-01'],
  },
}

// customerId -> (productId -> quantity). Prices are applied at read time from the warehouse header.
export const baskets = new Map<string, Map<string, number>>()
export const MAX_ITEM_QUANTITY = 99

// customerId -> favorited product ids, in the order they were added.
export const favorites = new Map<string, Set<string>>()

type Slide = { image: string; link: string; alt: string }
type Card = { title: string; text: string; label: string; link: string; image: string }

// A banner with more than one slide is shown as a carousel; shelves and card rows always are.
export type Block =
  | { type: 'hero'; id: string; title: string; text: string; actions: { label: string; link: string }[]; slides: Slide[] }
  | { type: 'banner'; id: string; slides: Slide[] }
  | { type: 'shelf'; id: string; title: string; productIds: string[] }
  | { type: 'tabbed-shelf'; id: string; title: string; banner: Slide; tabs: { label: string; productIds: string[] }[] }
  | { type: 'cards'; id: string; title: string; items: Card[] }
  | { type: 'shortcuts'; id: string; items: { label: string; link: string; icon: string }[] }
  | { type: 'callout'; id: string; label: string; text: string; link?: string }
  | { type: 'info-bar'; id: string; text: string; link?: string }
  | { type: 'categories'; id: string; title: string; items: { label: string; description: string; link: string }[] }
  | { type: 'benefits'; id: string; items: { title: string; description: string }[] }

const slide = (slug: string, link: string, alt: string, h = 400) => ({ image: `/images/${slug}.svg?w=1200&h=${h}`, link, alt })
const shelf = (id: string, title: string, productIds: string[]): Block => ({ type: 'shelf', id, title, productIds })
const card = (slug: string, title: string, text: string, label: string, link: string): Card =>
  ({ title, text, label, link, image: `/images/${slug}.svg?w=480&h=640` })
const shortcut = (slug: string, label: string, link: string) => ({ label, link, icon: `/images/${slug}.svg?w=144&h=144` })
// Tall (1:2): it stands beside the tabbed shelf.
const sideBanner = (slug: string, link: string, alt: string) => ({ image: `/images/${slug}.svg?w=600&h=1200`, link, alt })
const inCategory = (id: string) => Object.values(products).filter((p) => p.category === id || p.subcategory === id).map((p) => p.id)
const deals = () => Object.values(products).filter((p) => p.listPrice > p.basePrice).map((p) => p.id)

// The home follows a large retailer's block rhythm: hero, promo cards, shortcuts, a callout, categories, then shelves
// alternating with card rows.
export const pages: Record<string, Block[]> = {
  home: [
    { type: 'info-bar', id: 'shipping', text: 'Frete grátis nas compras acima de R$ 199', link: '/c/corrida' },
    {
      type: 'hero', id: 'hero',
      title: 'Equipamento para quem treina de verdade',
      text: 'Tênis, relógios e acessórios com o preço do seu estoque mais próximo. Troca em 30 dias.',
      actions: [{ label: 'Ver ofertas', link: '/ofertas' }, { label: 'Corrida', link: '/c/corrida' }],
      slides: [
        slide('hero-corrida', '/product/tenis-runner', 'Tênis Runner com até 25% off', 900),
        slide('hero-relogio', '/product/relogio-gps', 'Relógio GPS: treine com dados', 900),
        slide('hero-inverno', '/product/jaqueta-corta-vento', 'Coleção corta-vento', 900),
        slide('hero-mochila', '/product/mochila-urban', 'Mochila Urban: notebook e treino na mesma bolsa', 900),
        slide('hero-fone', '/product/fone-sport', 'Fone Sport: sem fio e à prova de suor', 900),
        slide('hero-garrafa', '/product/garrafa-termica', 'Garrafa térmica: 12h na temperatura certa', 900),
        slide('hero-novidades', '/novidades', 'Novidades da semana', 900),
        slide('hero-ofertas', '/ofertas', 'Ofertas com até 25% off', 900),
      ],
    },
    {
      type: 'cards', id: 'flash-deals', title: 'Ofertas da semana', items: [
        card('tenis-off', 'Tênis com até 25% off', 'Amortecimento leve para treino e prova.', 'Quero', '/c/tenis'),
        card('roupas-off', 'Roupas com até 25% off', 'Secagem rápida para dias quentes.', 'Quero', '/c/roupas'),
        card('relogio-off', 'Relógio GPS com 10% off', 'Pace, distância e frequência no pulso.', 'Quero', '/product/relogio-gps'),
        card('acessorios', 'Acessórios em oferta', 'Mochilas, bonés e garrafas.', 'Quero', '/c/acessorios'),
        card('meias-off', 'Meias de compressão', 'Kit com 3 pares.', 'Quero', '/product/meia-pro'),
        card('ofertas', 'Todas as ofertas', 'Tudo com desconto em um só lugar.', 'Ver tudo', '/ofertas'),
      ],
    },
    {
      type: 'shortcuts', id: 'shortcuts', items: [
        shortcut('ofertas', 'Ofertas', '/ofertas'),
        shortcut('novidades', 'Novidades', '/novidades'),
        shortcut('tenis', 'Tênis', '/c/tenis'),
        shortcut('relogios', 'Relógios', '/c/relogios'),
        shortcut('mochilas', 'Mochilas', '/c/mochilas'),
      ],
    },
    { type: 'callout', id: 'stock-by-cep', label: 'Estoque por CEP', text: 'Informe seu CEP no topo da página e veja o preço e o estoque da sua região.' },
    {
      type: 'categories', id: 'departments', title: 'Encontre a categoria certa para você',
      items: Object.values(categories).map((c) => ({ label: c.name, description: c.description, link: `/c/${c.id}` })),
    },
    {
      type: 'tabbed-shelf', id: 'highlights', title: 'Aproveite o melhor da playground',
      banner: sideBanner('destaques', '/ofertas', 'Ofertas de corrida com até 25% off'),
      tabs: [
        { label: 'Mais vendidos', productIds: ['tenis-runner', 'camiseta-basic', 'mochila-urban', 'relogio-gps', 'bermuda-dry', 'fone-sport'] },
        { label: 'Corrida', productIds: inCategory('corrida') },
        { label: 'Acessórios', productIds: inCategory('acessorios') },
      ],
    },
    shelf('best-sellers', 'Ofertas que você vai amar', deals()),
    {
      type: 'cards', id: 'launches', title: 'Lançamentos', items: [
        card('novo-jaqueta', 'Jaqueta Corta-Vento', 'Leve, compacta e pronta para a chuva.', 'Conhecer', '/product/jaqueta-corta-vento'),
        card('novo-garrafa', 'Garrafa Térmica', 'Água gelada do primeiro ao último km.', 'Conhecer', '/product/garrafa-termica'),
        card('novo-relogio', 'Relógio GPS', 'Treinos guiados e bateria para a semana.', 'Conhecer', '/product/relogio-gps'),
        card('novo-fone', 'Fone Sport', 'Encaixe firme para correr sem tirar.', 'Conhecer', '/product/fone-sport'),
      ],
    },
    {
      type: 'tabbed-shelf', id: 'favorites', title: 'Favoritos para o seu treino',
      banner: sideBanner('favoritos', '/c/corrida', 'Tudo para correr'),
      tabs: [
        { label: 'Ofertas', productIds: deals() },
        { label: 'Corrida', productIds: inCategory('corrida') },
        { label: 'Acessórios', productIds: inCategory('acessorios') },
        { label: 'Eletrônicos', productIds: inCategory('eletronicos') },
      ],
    },
    {
      type: 'cards', id: 'departments-editorial', title: 'Por categoria', items: [
        card('cat-tenis', 'Tênis', 'Leves para treino e prova.', 'Comprar', '/c/tenis'),
        card('cat-roupas', 'Roupas', 'Camisetas, bermudas e jaquetas.', 'Comprar', '/c/roupas'),
        card('cat-mochilas', 'Mochilas', 'Para o dia a dia e o trabalho.', 'Comprar', '/c/mochilas'),
        card('cat-garrafas', 'Garrafas', 'Térmicas e squeezes.', 'Comprar', '/c/garrafas'),
        card('cat-relogios', 'Relógios', 'GPS e frequência cardíaca.', 'Comprar', '/c/relogios'),
        card('cat-fones', 'Fones', 'Sem fio para treinar.', 'Comprar', '/c/fones'),
      ],
    },
    shelf('accessories', 'Para completar o treino', ['meia-pro', 'bone-trail', 'garrafa-termica', 'camiseta-basic', 'bermuda-dry']),
    {
      type: 'cards', id: 'about', title: 'Comprar na playground', items: [
        card('frete', 'Frete grátis', 'Acima de R$ 199 para todo o Brasil.', 'Ver produtos', '/c/corrida'),
        card('troca', 'Troca fácil', '30 dias para trocar ou devolver.', 'Ver novidades', '/novidades'),
        card('parcelas', 'Até 10x sem juros', 'No cartão de crédito, a partir de R$ 20.', 'Ver ofertas', '/ofertas'),
      ],
    },
  ],
  novidades: [shelf('new-arrivals', 'Novidades', ['jaqueta-corta-vento', 'garrafa-termica', 'bone-trail', 'meia-pro', 'mochila-urban'])],
  ofertas: [shelf('deals', 'Ofertas', deals())],
}
