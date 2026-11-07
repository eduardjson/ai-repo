import { useMemo } from 'react'

import { generateSlab, LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'

interface LayerMeshProps {
  model: BuildingModel
  opacity: number
}

export function InterfloorSlabMesh({ model, opacity }: LayerMeshProps) {
  const color = LAYER_DEFINITION_BY_TYPE.interfloorSlab.color
  const boxes = useMemo(
    () =>
      generateSlab(
        model.dims,
        model.params.interfloorSlab,
        model.elevations.wallTop,
        color,
        'interfloor-slab',
      ),
    [model.dims, model.params.interfloorSlab, model.elevations.wallTop, color],
  )
  return <Boxes boxes={boxes} opacity={opacity} />
}
