import { ROOF_MATERIALS, WALL_TYPES, FOUNDATIONS, getOption } from './config'

export interface ModuleConfig {
  length: number
  width: number
  height: number
  windows: number
  doors: number
  roofType: 'flat' | 'gable'
  roofMaterial: string
  wallType: string
  foundation: string
  wallColor: string
  roofColor: string
  margin: number
}

export const defaultConfig: ModuleConfig = {
  length: 6,
  width: 3,
  height: 2.5,
  windows: 2,
  doors: 1,
  roofType: 'gable',
  roofMaterial: 'proflist',
  wallType: 'frame',
  foundation: 'piles',
  wallColor: '#ece0c8',
  roofColor: '#546e7a',
  margin: 15,
}

export interface EstimateItem {
  name: string
  unit: string
  quantity: number
  rate: number
  total: number
}

export interface EstimateSection {
  title: string
  items: EstimateItem[]
}

export interface EstimateResult {
  sections: EstimateSection[]
  floorArea: number
  wallArea: number
  roofArea: number
  netWallArea: number
  subtotal: number
  marginAmount: number
  total: number
}

export function calculateEstimate(cfg: ModuleConfig): EstimateResult {
  const floorArea = cfg.length * cfg.width
  const perimeter = 2 * (cfg.length + cfg.width)
  const wallArea = perimeter * cfg.height
  const openingsArea = cfg.windows * 1.0 + cfg.doors * 1.9
  const netWallArea = Math.max(0, wallArea - openingsArea)
  const roofArea = cfg.roofType === 'gable' ? floorArea * 1.15 : floorArea

  const wall = getOption(WALL_TYPES, cfg.wallType)
  const roof = getOption(ROOF_MATERIALS, cfg.roofMaterial)
  const foundation = getOption(FOUNDATIONS, cfg.foundation)

  const rawSections: { title: string; items: Omit<EstimateItem, 'total'>[] }[] = [
    {
      title: 'Фундамент',
      items: [
        { name: `Фундамент — ${foundation.label}`, unit: 'м²', quantity: floorArea, rate: foundation.rate },
      ],
    },
    {
      title: 'Стены и каркас',
      items: [
        { name: `Стены — ${wall.label}`, unit: 'м²', quantity: netWallArea, rate: wall.rate },
        { name: 'Обшивка OSB-3', unit: 'м²', quantity: netWallArea * 2, rate: 420 },
        { name: 'Утеплитель стен', unit: 'м²', quantity: netWallArea, rate: 340 },
      ],
    },
    {
      title: 'Кровля',
      items: [
        { name: `Кровля — ${roof.label}`, unit: 'м²', quantity: roofArea, rate: roof.rate },
        { name: 'Утепление кровли', unit: 'м²', quantity: roofArea, rate: 320 },
      ],
    },
    {
      title: 'Пол',
      items: [
        { name: 'Напольное покрытие', unit: 'м²', quantity: floorArea, rate: 640 },
        { name: 'Утепление пола', unit: 'м²', quantity: floorArea, rate: 300 },
      ],
    },
    {
      title: 'Окна и двери',
      items: [
        { name: 'Окно ПВХ', unit: 'шт', quantity: cfg.windows, rate: 8500 },
        { name: 'Дверь', unit: 'шт', quantity: cfg.doors, rate: 14500 },
      ],
    },
    {
      title: 'Отделка',
      items: [
        { name: 'Внутренняя отделка', unit: 'м²', quantity: netWallArea + floorArea, rate: 460 },
        { name: 'Наружная отделка', unit: 'м²', quantity: netWallArea, rate: 520 },
      ],
    },
    {
      title: 'Инженерия',
      items: [
        { name: 'Электромонтаж', unit: 'модуль', quantity: 1, rate: 26000 },
        { name: 'Сантехника', unit: 'модуль', quantity: 1, rate: 18000 },
      ],
    },
    {
      title: 'Монтажные работы',
      items: [
        { name: 'Монтаж стен и кровли', unit: 'м²', quantity: netWallArea + roofArea, rate: 850 },
        { name: 'Монтаж пола', unit: 'м²', quantity: floorArea, rate: 600 },
      ],
    },
  ]

  const sections: EstimateSection[] = rawSections.map((sec) => ({
    title: sec.title,
    items: sec.items.map((it) => ({ ...it, total: it.quantity * it.rate })),
  }))

  const subtotal = sections.reduce(
    (s, sec) => s + sec.items.reduce((x, it) => x + it.total, 0),
    0,
  )
  const marginAmount = (subtotal * cfg.margin) / 100
  const total = subtotal + marginAmount

  return { sections, floorArea, wallArea, roofArea, netWallArea, subtotal, marginAmount, total }
}

export function exportEstimateCsv(cfg: ModuleConfig, estimate: EstimateResult) {
  const csvNum = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',')

  const rows: string[] = ['Раздел;Наименование;Ед.;Кол-во;Цена;Сумма']
  for (const sec of estimate.sections) {
    rows.push(`${sec.title};;;;;`)
    for (const it of sec.items) {
      rows.push(`;${it.name};${it.unit};${csvNum(it.quantity)};${csvNum(it.rate)};${csvNum(it.total)}`)
    }
  }
  rows.push(';;;;;')
  rows.push(`Итого по смете;;;;;${csvNum(estimate.subtotal)}`)
  rows.push(`Наценка (${cfg.margin}%);;;;;${csvNum(estimate.marginAmount)}`)
  rows.push(`ИТОГО;;;;;${csvNum(estimate.total)}`)

  const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'smeta-modulya.csv'
  a.click()
  URL.revokeObjectURL(url)
}
