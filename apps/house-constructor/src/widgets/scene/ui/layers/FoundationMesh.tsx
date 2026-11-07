import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { generateFoundationGeometry, openJumperMenu, selectJumper } from '@/entities/foundation'
import { LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'

interface LayerMeshProps {
  model: BuildingModel
  opacity: number
}

const ACCENT = '#2563eb'

export function FoundationMesh({ model, opacity }: LayerMeshProps) {
  const dispatch = useAppDispatch()
  const tool = useAppSelector((state) => state.tools.tool)
  const selectedJumperId = useAppSelector((state) => state.foundation.selectedJumperId)

  const color = LAYER_DEFINITION_BY_TYPE.foundation.color
  const geometry = useMemo(
    () =>
      generateFoundationGeometry(
        model.dims,
        model.params.foundation,
        model.jumpers,
        model.slabEnabled,
        model.slabThickness,
        color,
      ),
    [model.dims, model.params.foundation, model.jumpers, model.slabEnabled, model.slabThickness, color],
  )

  const jumperBoxes = useMemo(
    () =>
      geometry.jumpers.map((box) =>
        box.id === selectedJumperId ? { ...box, color: ACCENT } : box,
      ),
    [geometry.jumpers, selectedJumperId],
  )

  const select = (id: string, event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    dispatch(selectJumper(id))
  }

  const openMenu = (id: string, event: ThreeEvent<MouseEvent>) => {
    dispatch(
      openJumperMenu({
        jumperId: id,
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      }),
    )
  }

  return (
    <group>
      <Boxes boxes={geometry.strips} opacity={opacity} />
      {geometry.slab ? <Boxes boxes={[geometry.slab]} opacity={opacity} /> : null}
      <Boxes
        boxes={jumperBoxes}
        opacity={opacity}
        onClick={tool === 'select' ? select : undefined}
        onContextMenu={openMenu}
      />
    </group>
  )
}
