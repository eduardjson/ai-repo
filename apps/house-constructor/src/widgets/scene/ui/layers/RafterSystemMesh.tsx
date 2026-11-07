import { useMemo } from 'react'

import { generateRafters, LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'

interface LayerMeshProps {
  model: BuildingModel
  opacity: number
}

export function RafterSystemMesh({ model, opacity }: LayerMeshProps) {
  const color = LAYER_DEFINITION_BY_TYPE.rafterSystem.color
  const boxes = useMemo(
    () => generateRafters(model.dims, model.params.rafterSystem, model.elevations.wallTop, color),
    [model.dims, model.params.rafterSystem, model.elevations.wallTop, color],
  )
  return <Boxes boxes={boxes} opacity={opacity} />
}
