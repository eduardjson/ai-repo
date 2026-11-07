import type { BuildingDims } from '@/entities/building'
import type { BoxSpec } from '@/entities/layer'
import { createId } from '@/shared/lib/id'

import type { FoundationJumper } from '../model/types'

export interface FoundationGeometry {
  /** Ленты периметра. */
  strips: BoxSpec[]
  /** Внутренние перемычки. */
  jumpers: BoxSpec[]
  /** Сплошная плита по верху ленты (если включена). */
  slab: BoxSpec | null
}

/**
 * Геометрия ленточного фундамента: четыре ленты периметра + внутренние перемычки
 * + опциональная сплошная плита по верху.
 * Лента идёт от «-depth» (заглубление) до «+height» (цоколь).
 * При плитном фундаменте лента смещается вниз на толщину плиты, чтобы верх
 * (нулевая отметка) остался на прежней высоте.
 */
export function generateFoundationGeometry(
  dims: BuildingDims,
  params: Record<string, number>,
  jumpers: FoundationJumper[],
  slabEnabled: boolean,
  slabThickness: number,
  color: string,
): FoundationGeometry {
  const L = dims.length
  const W = dims.width
  const t = params.thickness ?? 0.4
  const depth = params.depth ?? 0.6
  const height = params.height ?? 0.5

  const total = depth + height
  const slabOffset = slabEnabled ? slabThickness : 0
  const cy = (height - depth) / 2 - slabOffset
  const inset = W / 2 - t / 2
  const insetX = L / 2 - t / 2

  const strips: BoxSpec[] = [
    { id: createId('foundation-front'), position: [0, cy, inset], size: [L, total, t], color },
    { id: createId('foundation-back'), position: [0, cy, -inset], size: [L, total, t], color },
    { id: createId('foundation-right'), position: [insetX, cy, 0], size: [t, total, W], color },
    { id: createId('foundation-left'), position: [-insetX, cy, 0], size: [t, total, W], color },
  ]

  const jumperBoxes: BoxSpec[] = jumpers.map((jumper) =>
    jumper.orientation === 'along'
      ? {
          id: jumper.id,
          position: [0, cy, jumper.position],
          size: [L, total, jumper.thickness],
          color,
        }
      : {
          id: jumper.id,
          position: [jumper.position, cy, 0],
          size: [jumper.thickness, total, W],
          color,
        },
  )

  const slab: BoxSpec | null = slabEnabled
    ? {
        id: createId('foundation-slab'),
        position: [0, height - slabThickness / 2, 0],
        size: [L, slabThickness, W],
        color,
      }
    : null

  return { strips, jumpers: jumperBoxes, slab }
}
