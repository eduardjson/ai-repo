import type { BuildingDims } from '@/entities/building'
import {
  DEFAULT_OPENING_DIMS,
  wallLength,
  worldToWallLocal,
  type OpeningType,
  type WallIndex,
} from '@/entities/opening'
import { clamp } from '@/shared/lib/math'

/**
 * Превращает клик по стене (мировая точка) в корректную позицию проёма,
 * ограниченную габаритами стены.
 */
export function resolvePlacement(
  dims: BuildingDims,
  wall: WallIndex,
  x: number,
  z: number,
  type: OpeningType,
): number {
  const length = wallLength(dims, wall)
  const halfWidth = DEFAULT_OPENING_DIMS[type].width / 2
  const u = worldToWallLocal(dims, wall, x, z)
  return clamp(u, halfWidth, Math.max(halfWidth, length - halfWidth))
}
