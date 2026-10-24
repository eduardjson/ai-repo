import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ROOF_MATERIALS, WALL_TYPES, FOUNDATIONS, getOption, type RateMap } from './config'

export interface ModuleConfig {
  length: number
  width: number
  height: number
  windows: number
  doors: number
  partitions: number
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
  partitions: 1,
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

interface RawItem {
  name: string
  unit: string
  quantity: number
  rateKey: string
}

export interface EstimateResult {
  sections: EstimateSection[]
  floorArea: number
  wallArea: number
  roofArea: number
  netWallArea: number
  partitionArea: number
  subtotal: number
  marginAmount: number
  total: number
}

export function calculateEstimate(cfg: ModuleConfig, rates: RateMap): EstimateResult {
  const r = (key: string) => rates[key] ?? 0

  const floorArea = cfg.length * cfg.width
  const perimeter = 2 * (cfg.length + cfg.width)
  const wallArea = perimeter * cfg.height
  const openingsArea = cfg.windows * 1.0 + cfg.doors * 1.9
  const netWallArea = Math.max(0, wallArea - openingsArea)
  const roofArea = cfg.roofType === 'gable' ? floorArea * 1.15 : floorArea
  const partitionArea = cfg.partitions * cfg.width * cfg.height

  const wall = getOption(WALL_TYPES, cfg.wallType)
  const roof = getOption(ROOF_MATERIALS, cfg.roofMaterial)
  const foundation = getOption(FOUNDATIONS, cfg.foundation)

  const rawSections: { title: string; items: RawItem[] }[] = [
    {
      title: 'Фундамент',
      items: [
        { name: `Фундамент — ${foundation.label}`, unit: 'м²', quantity: floorArea, rateKey: foundation.rateKey },
      ],
    },
    {
      title: 'Стены и каркас',
      items: [
        { name: `Стены — ${wall.label}`, unit: 'м²', quantity: netWallArea, rateKey: wall.rateKey },
        { name: 'Обшивка OSB-3', unit: 'м²', quantity: netWallArea * 2, rateKey: 'osb' },
        { name: 'Утеплитель стен', unit: 'м²', quantity: netWallArea, rateKey: 'insulation_wall' },
      ],
    },
    {
      title: 'Кровля',
      items: [
        { name: `Кровля — ${roof.label}`, unit: 'м²', quantity: roofArea, rateKey: roof.rateKey },
        { name: 'Утепление кровли', unit: 'м²', quantity: roofArea, rateKey: 'insulation_roof' },
      ],
    },
    {
      title: 'Пол',
      items: [
        { name: 'Напольное покрытие', unit: 'м²', quantity: floorArea, rateKey: 'floor' },
        { name: 'Утепление пола', unit: 'м²', quantity: floorArea, rateKey: 'insulation_floor' },
      ],
    },
    {
      title: 'Перегородки',
      items: [
        { name: 'Внутренние перегородки', unit: 'м²', quantity: partitionArea, rateKey: 'partition' },
      ],
    },
    {
      title: 'Окна и двери',
      items: [
        { name: 'Окно ПВХ', unit: 'шт', quantity: cfg.windows, rateKey: 'window' },
        { name: 'Дверь', unit: 'шт', quantity: cfg.doors, rateKey: 'door' },
      ],
    },
    {
      title: 'Отделка',
      items: [
        { name: 'Внутренняя отделка', unit: 'м²', quantity: netWallArea + floorArea, rateKey: 'finish_in' },
        { name: 'Наружная отделка', unit: 'м²', quantity: netWallArea, rateKey: 'finish_out' },
      ],
    },
    {
      title: 'Инженерия',
      items: [
        { name: 'Электромонтаж', unit: 'модуль', quantity: 1, rateKey: 'electric' },
        { name: 'Сантехника', unit: 'модуль', quantity: 1, rateKey: 'plumbing' },
      ],
    },
    {
      title: 'Монтажные работы',
      items: [
        { name: 'Монтаж стен и кровли', unit: 'м²', quantity: netWallArea + roofArea, rateKey: 'work_mount' },
        { name: 'Монтаж пола', unit: 'м²', quantity: floorArea, rateKey: 'work_floor' },
      ],
    },
  ]

  const sections: EstimateSection[] = rawSections.map((sec) => ({
    title: sec.title,
    items: sec.items.map((it) => {
      const rate = r(it.rateKey)
      return { name: it.name, unit: it.unit, quantity: it.quantity, rate, total: it.quantity * rate }
    }),
  }))

  const subtotal = sections.reduce(
    (s, sec) => s + sec.items.reduce((x, it) => x + it.total, 0),
    0,
  )
  const marginAmount = (subtotal * cfg.margin) / 100
  const total = subtotal + marginAmount

  return { sections, floorArea, wallArea, roofArea, netWallArea, partitionArea, subtotal, marginAmount, total }
}

const csvNum = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',')

export function exportEstimateCsv(cfg: ModuleConfig, estimate: EstimateResult) {
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

const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`
const fmtQty = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1).replace('.', ','))

export function exportEstimatePdf(cfg: ModuleConfig, estimate: EstimateResult) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Смета — жилой модуль', 14, 16)
  doc.setFontSize(10)
  doc.text(`Габариты: ${cfg.length} x ${cfg.width} x ${cfg.height} м`, 14, 24)
  doc.text(`Площадь пола: ${estimate.floorArea.toFixed(1)} м², стен: ${estimate.netWallArea.toFixed(1)} м², кровли: ${estimate.roofArea.toFixed(1)} м²`, 14, 30)

  const body: (string | { content: string; colSpan: number; styles: Record<string, unknown> })[][] = []
  for (const sec of estimate.sections) {
    body.push([{ content: sec.title, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }])
    for (const it of sec.items) {
      body.push([it.name, `${fmtQty(it.quantity)} ${it.unit}`, fmtMoney(it.total)])
    }
  }

  autoTable(doc, {
    head: [['Наименование', 'Кол-во', 'Сумма']],
    body,
    startY: 36,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210] },
  })

  const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`Итого по смете: ${fmtMoney(estimate.subtotal)}`, 14, y)
  doc.text(`Наценка (${cfg.margin}%): ${fmtMoney(estimate.marginAmount)}`, 14, y + 7)
  doc.setFont('helvetica', 'bold')
  doc.text(`ИТОГО: ${fmtMoney(estimate.total)}`, 14, y + 16)

  doc.save('smeta-modulya.pdf')
}
