/** Ориентация внутренней перемычки фундамента. */
export const JUMPER_ORIENTATIONS = ['along', 'across'] as const
export type JumperOrientation = (typeof JUMPER_ORIENTATIONS)[number]

export const JUMPER_ORIENTATION_LABELS: Record<JumperOrientation, string> = {
  along: 'Продольная (вдоль длины)',
  across: 'Поперечная (вдоль ширины)',
}

export interface FoundationJumper {
  id: string
  orientation: JumperOrientation
  /** Смещение от центра вдоль перпендикулярной оси, метры. */
  position: number
  /** Ширина ленты перемычки, метры. */
  thickness: number
}

/** Толщина сплошной плиты по умолчанию, метры. */
export const DEFAULT_SLAB_THICKNESS = 0.15
