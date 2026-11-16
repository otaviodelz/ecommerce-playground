export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// Up to 10 interest-free installments of at least R$ 10; null when it can't be split.
export function installments(cents: number) {
  const count = Math.min(10, Math.floor(cents / 1000))
  return count >= 2 ? { count, value: Math.round(cents / count) } : null
}

export const discountPercent = (price: number, listPrice: number) =>
  listPrice > price ? Math.round((1 - price / listPrice) * 100) : 0
