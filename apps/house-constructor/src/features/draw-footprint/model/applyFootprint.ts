import { roundTo } from '@/shared/lib/math'

export interface FootprintResult {
  length: number
  width: number
  x: number
  z: number
}

/**
 * Преобразует две точки прямоугольника (клик+драг по земле)
 * в габариты и центр здания.
 */
export function applyFootprint(
  a: { x: number; z: number },
  b: { x: number; z: number },
): FootprintResult | null {
  const length = Math.abs(b.x - a.x)
  const width = Math.abs(b.z - a.z)

  if (length < 0.3 || width < 0.3) return null

  return {
    length: roundTo(length, 0.1),
    width: roundTo(width, 0.1),
    x: roundTo((a.x + b.x) / 2, 0.05),
    z: roundTo((a.z + b.z) / 2, 0.05),
  }
}
