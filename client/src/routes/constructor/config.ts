export interface Option {
  value: string
  label: string
  rate: number
}

export interface ColorOption {
  value: string
  label: string
}

export const ROOF_MATERIALS: Option[] = [
  { value: 'proflist', label: 'Профлист', rate: 690 },
  { value: 'metal', label: 'Металлочерепица', rate: 1150 },
  { value: 'soft', label: 'Мягкая кровля', rate: 1350 },
]

export const WALL_TYPES: Option[] = [
  { value: 'frame', label: 'Каркас (брус + OSB)', rate: 1450 },
  { value: 'sip', label: 'СИП-панели', rate: 2100 },
  { value: 'gas', label: 'Газобетон', rate: 2800 },
]

export const FOUNDATIONS: Option[] = [
  { value: 'piles', label: 'Винтовые сваи', rate: 1900 },
  { value: 'tape', label: 'Ленточный', rate: 2800 },
  { value: 'slab', label: 'Монолитная плита', rate: 4200 },
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
