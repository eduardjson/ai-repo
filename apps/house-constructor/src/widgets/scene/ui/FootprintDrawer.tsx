import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setFootprint } from '@/entities/building'
import { selectOpening } from '@/entities/opening'
import { applyFootprint } from '@/features/draw-footprint'

interface DragState {
  start: [number, number]
  current: [number, number]
}

function capturePointer(event: ThreeEvent<PointerEvent>) {
  const target = event.target as unknown as { setPointerCapture?: (id: number) => void }
  target.setPointerCapture?.(event.pointerId)
}

/**
 * Невидимая плоскость на уровне земли:
 * — в режиме «Контур» рисует прямоугольник фундамента (клик + драг);
 * — в режиме «Выбрать» сбрасывает выделение при клике по пустому месту.
 */
export function FootprintDrawer() {
  const dispatch = useAppDispatch()
  const tool = useAppSelector((state) => state.tools.tool)
  const [drag, setDrag] = useState<DragState | null>(null)

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (tool !== 'drawFootprint') return
    event.stopPropagation()
    capturePointer(event)
    setDrag({ start: [event.point.x, event.point.z], current: [event.point.x, event.point.z] })
  }

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (tool !== 'drawFootprint' || !drag) return
    setDrag((d) => (d ? { ...d, current: [event.point.x, event.point.z] } : d))
  }

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (tool !== 'drawFootprint' || !drag) return
    const result = applyFootprint(
      { x: drag.start[0], z: drag.start[1] },
      { x: event.point.x, z: event.point.z },
    )
    if (result) dispatch(setFootprint(result))
    setDrag(null)
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (tool === 'select') {
      event.stopPropagation()
      dispatch(selectOpening(null))
    }
  }

  const preview = drag
    ? {
        length: Math.abs(drag.current[0] - drag.start[0]),
        width: Math.abs(drag.current[1] - drag.start[1]),
        centerX: (drag.start[0] + drag.current[0]) / 2,
        centerZ: (drag.start[1] + drag.current[1]) / 2,
      }
    : null

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 0]}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {preview ? (
        <mesh position={[preview.centerX, 0.05, preview.centerZ]}>
          <boxGeometry args={[preview.length, 0.02, preview.width]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      ) : null}
    </>
  )
}
