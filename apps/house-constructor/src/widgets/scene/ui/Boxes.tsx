import type { ThreeEvent } from '@react-three/fiber'

import type { BoxSpec } from '@/entities/layer'

interface BoxesProps {
  boxes: BoxSpec[]
  /** Непрозрачность слоя (умножается на базовую непрозрачность бокса). */
  opacity?: number
  onClick?: (id: string, event: ThreeEvent<MouseEvent>) => void
  onContextMenu?: (id: string, event: ThreeEvent<MouseEvent>) => void
  castShadow?: boolean
}

/**
 * Рендерит набор боксов из чистой спецификации геометрии.
 */
export function Boxes({ boxes, opacity = 1, onClick, onContextMenu, castShadow = true }: BoxesProps) {
  return (
    <>
      {boxes.map((box) => {
        const finalOpacity = (box.opacity ?? 1) * opacity
        const transparent = finalOpacity < 0.999
        return (
          <mesh
            key={box.id}
            position={box.position}
            rotation={box.rotation ?? [0, 0, 0]}
            castShadow={castShadow}
            receiveShadow
            onClick={
              onClick
                ? (event) => {
                    event.stopPropagation()
                    onClick(box.id, event)
                  }
                : undefined
            }
            onContextMenu={
              onContextMenu
                ? (event) => {
                    event.stopPropagation()
                    event.nativeEvent.preventDefault()
                    onContextMenu(box.id, event)
                  }
                : undefined
            }
          >
            <boxGeometry args={box.size} />
            <meshStandardMaterial
              color={box.color}
              roughness={0.85}
              metalness={0.05}
              transparent={transparent}
              opacity={finalOpacity}
              depthWrite={!transparent}
            />
          </mesh>
        )
      })}
    </>
  )
}
