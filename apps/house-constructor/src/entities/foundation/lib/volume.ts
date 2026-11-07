import type { BuildingDims } from '@/entities/building'

import type { FoundationJumper } from '../model/types'

/**
 * Объём бетона для заливки фундамента (м³):
 * ленты периметра + внутренние перемычки + плита (если включена).
 */
export function computeConcreteVolume(
  dims: BuildingDims,
  params: Record<string, number>,
  jumpers: FoundationJumper[],
  slabEnabled: boolean,
  slabThickness: number,
): number {
  const L = dims.length
  const W = dims.width
  const t = params.thickness ?? 0.4
  const depth = params.depth ?? 0.6
  const height = params.height ?? 0.5
  const total = depth + height

  // Площадь кольца периметра (без двойного учёта углов).
  const ringArea = 2 * t * (L + W) - 4 * t * t

  const jumperArea = jumpers.reduce((sum, jumper) => {
    const length = jumper.orientation === 'along' ? L : W
    return sum + length * jumper.thickness
  }, 0)

  const slabVolume = slabEnabled ? L * W * slabThickness : 0

  return (ringArea + jumperArea) * total + slabVolume
}
