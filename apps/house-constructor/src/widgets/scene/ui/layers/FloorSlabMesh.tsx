import { useMemo } from 'react'

import { generateSlab, LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'

interface LayerMeshProps {
  model: BuildingModel
  opacity: number
}

export function FloorSlabMesh({ model, opacity }: LayerMeshProps) {
  const color = LAYER_DEFINITION_BY_TYPE.floorSlab.color
  const boxes = useMemo(
    () => generateSlab(model.dims, model.params.floorSlab, model.elevations.foundationTop, color, 'floor-slab'),
    [model.dims, model.params.floorSlab, model.elevations.foundationTop, color],
  )
  return <Boxes boxes={boxes} opacity={opacity} />
}
