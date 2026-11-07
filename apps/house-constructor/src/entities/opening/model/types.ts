export const OPENING_TYPES = ['window', 'door'] as const
export type OpeningType = (typeof OPENING_TYPES)[number]

/**
 * Индекс стены периметра:
 * 0 — передняя (фасад), 1 — правая, 2 — задняя, 3 — левая.
 */
export type WallIndex = 0 | 1 | 2 | 3

export const WALL_LABELS: Record<WallIndex, string> = {
  0: 'Фасад (передняя)',
  1: 'Правая',
  2: 'Тыльная (задняя)',
  3: 'Левая',
}

export interface Opening {
  id: string
  type: OpeningType
  wall: WallIndex
  /** Расстояние от начала стены до центра проёма, метры. */
  position: number
  width: number
  height: number
  /** Высота низа проёма от пола (для окон). Для дверей всегда 0. */
  sill: number
}

/** Размеры нового проёма по умолчанию. */
export const DEFAULT_OPENING_DIMS: Record<
  OpeningType,
  { width: number; height: number; sill: number }
> = {
  window: { width: 1.2, height: 1.4, sill: 0.9 },
  door: { width: 0.9, height: 2.1, sill: 0 },
}
