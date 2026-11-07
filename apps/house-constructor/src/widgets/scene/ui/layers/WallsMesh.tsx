import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import { addOpening, generateWalls, selectOpening, wallFrame, type WallIndex } from '@/entities/opening'
import { resolvePlacement } from '@/features/add-opening'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'

interface WallsMeshProps {
  model: BuildingModel
  opacity: number
}

export function WallsMesh({ model, opacity }: WallsMeshProps) {
  const dispatch = useAppDispatch()
  const tool = useAppSelector((state) => state.tools.tool)

  const color = LAYER_DEFINITION_BY_TYPE.firstFloorWalls.color
  const geometry = useMemo(
    () =>
      generateWalls(
        model.dims,
        model.params.firstFloorWalls,
        model.openings,
        model.elevations.floorTop,
        color,
      ),
    [model.dims, model.params.firstFloorWalls, model.openings, model.elevations.floorTop, color],
  )

  const isPlacement = tool === 'addWindow' || tool === 'addDoor'

  const handleWallClick = (wall: WallIndex, event: ThreeEvent<MouseEvent>) => {
    if (!isPlacement) return
    event.stopPropagation()
    const type = tool === 'addWindow' ? 'window' : 'door'
    // event.point в мировых координатах; модель здания — в локальных (центр в 0).
    const localX = event.point.x - model.building.x
    const localZ = event.point.z - model.building.z
    const position = resolvePlacement(model.dims, wall, localX, localZ, type)
    dispatch(addOpening(wall, position, type))
  }

  const handleOpeningClick = (id: string, event: ThreeEvent<MouseEvent>) => {
    if (tool !== 'select') return
    event.stopPropagation()
    dispatch(selectOpening(id))
  }

  const thickness = model.params.firstFloorWalls.thickness ?? 0.3
  const height = model.params.firstFloorWalls.height ?? 3.0
  const baseY = model.elevations.floorTop

  return (
    <group>
      <Boxes boxes={geometry.segments} opacity={opacity} />
      <Boxes
        boxes={geometry.openings.map((opening) => opening.box)}
        opacity={opacity}
        onClick={tool === 'select' ? handleOpeningClick : undefined}
      />

      {isPlacement
        ? ([0, 1, 2, 3] as const).map((wall) => {
            const frame = wallFrame(model.dims, wall, thickness)
            const size: [number, number, number] =
              frame.alongAxis === 'x'
                ? [frame.length, height, thickness]
                : [thickness, height, frame.length]
            return (
              <mesh
                key={`hitbox-${wall}`}
                position={[frame.centerX, baseY + height / 2, frame.centerZ]}
                onClick={(event) => handleWallClick(wall, event)}
              >
                <boxGeometry args={size} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )
          })
        : null}
    </group>
  )
}
