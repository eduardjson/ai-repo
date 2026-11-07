export interface BuildingDims {
  length: number
  width: number
}

export interface BuildingPosition {
  x: number
  z: number
}

export interface Building extends BuildingDims, BuildingPosition {}

export const DEFAULT_BUILDING: Building = {
  length: 10,
  width: 8,
  x: 0,
  z: 0,
}
