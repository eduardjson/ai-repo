export interface Option {
  value: string
  label: string
  rateKey: string
}

export interface ColorOption {
  value: string
  label: string
}

export type RateMap = Record<string, number>

// Базовая расценка (₽ за единицу). Можно переопределить на странице.
export const DEFAULT_RATES: RateMap = {
  foundation_piles: 1900,
  foundation_tape: 2800,
  foundation_slab: 4200,
  wall_frame: 1450,
  wall_sip: 2100,
  wall_gas: 2800,
  roof_proflist: 690,
  roof_metal: 1150,
  roof_soft: 1350,
  osb: 420,
  insulation_wall: 340,
  insulation_roof: 320,
  insulation_floor: 300,
  floor: 640,
  partition: 900,
  finish_in: 460,
  finish_out: 520,
  window: 8500,
  door: 14500,
  electric: 26000,
  plumbing: 18000,
  work_mount: 850,
  work_floor: 600,
}

export const ROOF_MATERIALS: Option[] = [
  { value: 'proflist', label: 'Профлист', rateKey: 'roof_proflist' },
  { value: 'metal', label: 'Металлочерепица', rateKey: 'roof_metal' },
  { value: 'soft', label: 'Мягкая кровля', rateKey: 'roof_soft' },
]

export const WALL_TYPES: Option[] = [
  { value: 'frame', label: 'Каркас (брус + OSB)', rateKey: 'wall_frame' },
  { value: 'sip', label: 'СИП-панели', rateKey: 'wall_sip' },
  { value: 'gas', label: 'Газобетон', rateKey: 'wall_gas' },
]

export const FOUNDATIONS: Option[] = [
  { value: 'piles', label: 'Винтовые сваи', rateKey: 'foundation_piles' },
  { value: 'tape', label: 'Ленточный', rateKey: 'foundation_tape' },
  { value: 'slab', label: 'Монолитная плита', rateKey: 'foundation_slab' },
]

export const WALL_COLORS: ColorOption[] = [
  { value: '#f5f5f5', label: 'Белый' },
  { value: '#ece0c8', label: 'Бежевый' },
  { value: '#b0bec5', label: 'Серый' },
  { value: '#a5d6a7', label: 'Салатовый' },
]

export const ROOF_COLORS: ColorOption[] = [
  { value: '#546e7a', label: 'Серый' },
  { value: '#c62828', label: 'Красный' },
  { value: '#2e7d32', label: 'Зелёный' },
  { value: '#6d4c41', label: 'Коричневый' },
]

export const getOption = (list: Option[], value: string): Option =>
  list.find((o) => o.value === value) ?? list[0]
