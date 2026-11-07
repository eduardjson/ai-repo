export {
  addOpening,
  updateOpening,
  removeOpening,
  selectOpening,
  openingReducer,
} from './model/slice'
export { OPENING_TYPES, WALL_LABELS, DEFAULT_OPENING_DIMS } from './model/types'
export type { Opening, OpeningType, WallIndex } from './model/types'
export { wallLength, wallFrame, worldToWallLocal } from './lib/walls'
export type { WallFrame } from './lib/walls'
export { generateWalls } from './lib/wallsGeometry'
export type { OpeningVisual, WallsGeometry } from './lib/wallsGeometry'
