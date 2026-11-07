import type { LayerType } from '../model/types'

export interface Elevations {
  /** Верх фундамента (уровень чистого пола основания). */
  foundationTop: number
  /** Верх плиты пола (низ стен). */
  floorTop: number
  /** Верх стен первого этажа. */
  wallTop: number
  /** Верх межэтажного перекрытия. */
  interfloorTop: number
}

/** Вычисляет ключевые отметки по параметрам слоёв и отметке верха фундамента. */
export function computeElevations(
  params: Record<LayerType, Record<string, number>>,
  foundationTop: number,
): Elevations {
  const floorTop = foundationTop + (params.floorSlab.thickness ?? 0)
  const wallTop = floorTop + (params.firstFloorWalls.height ?? 0)
  const interfloorTop = wallTop + (params.interfloorSlab.thickness ?? 0)

  return { foundationTop, floorTop, wallTop, interfloorTop }
}

/** Рабочая плоскость (отметка сетки) для каждого слоя. */
export const LAYER_WORK_ELEVATION: Record<LayerType, (e: Elevations) => number> = {
  foundation: () => 0,
  floorSlab: (e) => e.foundationTop,
  firstFloorWalls: (e) => e.floorTop,
  interfloorSlab: (e) => e.wallTop,
  rafterSystem: (e) => e.wallTop,
  roofCovering: (e) => e.wallTop,
}
