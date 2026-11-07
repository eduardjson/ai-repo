export {
  setActiveLayer,
  setVisible,
  toggleVisible,
  setParam,
  resetLayer,
  layerReducer,
} from './model/slice'
export { LAYER_DEFINITIONS, LAYER_DEFINITION_BY_TYPE } from './model/definitions'
export { LAYER_TYPES } from './model/types'
export type { LayerType, LayerDefinition, LayerParamDef } from './model/types'
export { computeElevations, LAYER_WORK_ELEVATION } from './lib/elevations'
export type { Elevations } from './lib/elevations'
export { generateSlab, generateRafters, generateRoof } from './lib/generators'
export type { RoofGeometry } from './lib/generators'
export type { BoxSpec, TriangleSpec } from './lib/types'
