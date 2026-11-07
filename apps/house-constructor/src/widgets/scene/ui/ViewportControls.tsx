import { OrbitControls } from '@react-three/drei'

import { useAppSelector } from '@/app/hooks'

/**
 * Орбитальное управление камерой.
 * Отключается во время рисования контура, чтобы не вращать сцену.
 */
export function ViewportControls() {
  const tool = useAppSelector((state) => state.tools.tool)

  return (
    <OrbitControls
      makeDefault
      enabled={tool !== 'drawFootprint'}
      enableDamping
      dampingFactor={0.1}
      maxPolarAngle={Math.PI}
      minDistance={3}
      maxDistance={150}
    />
  )
}
