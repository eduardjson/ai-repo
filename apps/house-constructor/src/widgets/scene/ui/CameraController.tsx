import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { useAppSelector } from '@/app/hooks'
import type { ViewPreset } from '@/features/view'

interface OrbitControlsLike {
  target: THREE.Vector3
  update: () => void
}

const PRESETS: Record<ViewPreset, [number, number, number]> = {
  iso: [14, 10, 14],
  top: [0, 32, 0.001],
  front: [0, 4, 28],
  side: [28, 4, 0],
}

/**
 * Перемещает камеру при выборе предустановленного вида.
 */
export function CameraController() {
  const preset = useAppSelector((state) => state.view.preset)
  const resetNonce = useAppSelector((state) => state.view.resetNonce)
  const controls = useThree((state) => state.controls) as unknown as OrbitControlsLike | null
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!controls) return
    const position = PRESETS[preset]
    camera.position.set(position[0], position[1], position[2])
    controls.target.set(0, 2, 0)
    controls.update()
    // При frameloop="demand" камера не перерисуется сама — просим кадр явно.
    invalidate()
  }, [preset, resetNonce, controls, camera, invalidate])

  return null
}
