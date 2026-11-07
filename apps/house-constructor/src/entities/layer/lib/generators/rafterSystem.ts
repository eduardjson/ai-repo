import * as THREE from 'three'

import type { BuildingDims } from '@/entities/building'
import { createId } from '@/shared/lib/id'

import type { BoxSpec } from '../types'

/**
 * Стропильная система: двускатная крыша.
 * Стропила идут от карниза (свес) к коньку с заданным шагом.
 */
export function generateRafters(
  dims: BuildingDims,
  params: Record<string, number>,
  eaveY: number,
  color: string,
): BoxSpec[] {
  const L = dims.length
  const W = dims.width
  const spacing = params.spacing ?? 0.6
  const sectionWidth = params.sectionWidth ?? 0.1
  const sectionHeight = params.sectionHeight ?? 0.15
  const rise = params.rise ?? 1.5
  const overhang = params.overhang ?? 0.4

  const halfSpan = W / 2 + overhang
  const ridgeY = eaveY + rise
  const slopeLen = Math.hypot(halfSpan, rise)

  const xs: number[] = []
  for (let x = -L / 2; x <= L / 2 + 1e-6; x += spacing) xs.push(x)

  const specs: BoxSpec[] = []
  for (const side of [-1, 1] as const) {
    for (const x of xs) {
      const eave = new THREE.Vector3(x, eaveY, side * halfSpan)
      const ridge = new THREE.Vector3(x, ridgeY, 0)
      const mid = eave.clone().add(ridge).multiplyScalar(0.5)
      const dir = ridge.clone().sub(eave).normalize()

      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      )
      const euler = new THREE.Euler().setFromQuaternion(quaternion)

      specs.push({
        id: createId(`rafter-${side}-${x.toFixed(2)}`),
        position: [mid.x, mid.y, mid.z],
        size: [sectionWidth, slopeLen, sectionHeight],
        rotation: [euler.x, euler.y, euler.z],
        color,
      })
    }
  }

  // Коньковый прогон.
  specs.push({
    id: createId('ridge-board'),
    position: [0, ridgeY, 0],
    size: [L, sectionHeight, sectionWidth],
    color,
  })

  return specs
}
