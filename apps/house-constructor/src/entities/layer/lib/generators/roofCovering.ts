import * as THREE from 'three'

import type { BuildingDims } from '@/entities/building'
import { createId } from '@/shared/lib/id'

import type { BoxSpec, TriangleSpec } from '../types'

export interface RoofGeometry {
  slopes: BoxSpec[]
  gables: TriangleSpec[]
}

/**
 * Покрытие кровли: два ската + два фронтонных треугольника.
 */
export function generateRoof(
  dims: BuildingDims,
  params: Record<string, number>,
  eaveY: number,
  color: string,
): RoofGeometry {
  const L = dims.length
  const W = dims.width
  const thickness = params.thickness ?? 0.05
  const rise = params.rise ?? 1.5
  const overhang = params.overhang ?? 0.45

  const roofLength = L + 2 * overhang
  const halfSpan = W / 2 + overhang
  const ridgeY = eaveY + rise
  const slopeLen = Math.hypot(halfSpan, rise)

  const slopes: BoxSpec[] = []
  for (const side of [-1, 1] as const) {
    const eave = new THREE.Vector3(0, eaveY, side * halfSpan)
    const ridge = new THREE.Vector3(0, ridgeY, 0)
    const mid = eave.clone().add(ridge).multiplyScalar(0.5)
    const dir = ridge.clone().sub(eave).normalize()

    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    const euler = new THREE.Euler().setFromQuaternion(quaternion)

    slopes.push({
      id: createId(`roof-slope-${side}`),
      position: [mid.x, mid.y, mid.z],
      size: [roofLength, slopeLen, thickness],
      rotation: [euler.x, euler.y, euler.z],
      color,
    })
  }

  const gables: TriangleSpec[] = []
  const xEnd = roofLength / 2
  for (const side of [-1, 1] as const) {
    gables.push({
      id: createId(`gable-${side}`),
      a: [side * xEnd, eaveY, -halfSpan],
      b: [side * xEnd, ridgeY, 0],
      c: [side * xEnd, eaveY, halfSpan],
      color,
    })
  }

  return { slopes, gables }
}
