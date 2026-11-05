import type { CategoryDto } from '../api/generated'

export const VAT_RATES: { value: string; label: string }[] = [
  { value: 'VAT20', label: '20%' },
  { value: 'VAT10', label: '10%' },
  { value: 'VAT0', label: '0%' },
  { value: 'NONE', label: 'Без НДС' },
]

export const VAT_LABELS: Record<string, string> = Object.fromEntries(
  VAT_RATES.map((r) => [r.value, r.label]),
)

export const BARCODE_TYPES = ['EAN13', 'CODE128', 'UPC', 'QR'] as const

export const RECEIPT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  POSTED: 'Проведено',
  CANCELLED: 'Отменено',
}

export function formatMoney(n?: number | null): string {
  if (n == null) return '-'
  return `${n.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`
}

export function formatQty(n?: number | null): string {
  if (n == null) return '-'
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 3 })
}

/** Превращает дерево категорий в плоский список (с отступом для вложенных). */
export function flattenCategories(
  categories: CategoryDto[] | undefined,
  depth = 0,
): { id: string; label: string; depth: number }[] {
  const out: { id: string; label: string; depth: number }[] = []
  for (const c of categories ?? []) {
    out.push({ id: c.id, label: c.name, depth })
    out.push(...flattenCategories(c.children ?? [], depth + 1))
  }
  return out
}
