import type { BuildingDims } from '@/entities/building'
import { createId } from '@/shared/lib/id'

import type { BoxSpec } from '../types'

/** Плита перекрытия (пола или межэтажная) по всей площади здания. */
export function generateSlab(
  dims: BuildingDims,
  params: Record<string, number>,
  baseY: number,
  color: string,
  prefix: string,
): BoxSpec[] {
  const t = params.thickness ?? 0.2
  return [
    {
      id: createId(prefix),
      position: [0, baseY + t / 2, 0],
      size: [dims.length, t, dims.width],
      color,
    },
  ]
}
