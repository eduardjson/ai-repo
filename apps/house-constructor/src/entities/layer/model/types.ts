export const LAYER_TYPES = [
  'foundation',
  'floorSlab',
  'firstFloorWalls',
  'interfloorSlab',
  'rafterSystem',
  'roofCovering',
] as const

export type LayerType = (typeof LAYER_TYPES)[number]

/** Описание одного редактируемого параметра слоя. */
export interface LayerParamDef {
  key: string
  label: string
  unit: string
  min: number
  max: number
  step: number
}

/** Метаданные слоя: имя, порядок, цвет и параметры. */
export interface LayerDefinition {
  type: LayerType
  label: string
  description: string
  /** Вертикальный порядок снизу вверх (0 — фундамент). */
  order: number
  color: string
  paramDefs: LayerParamDef[]
  defaultParams: Record<string, number>
}
