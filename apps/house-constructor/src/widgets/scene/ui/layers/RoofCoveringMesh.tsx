import { useMemo } from 'react'

import { generateRoof, LAYER_DEFINITION_BY_TYPE } from '@/entities/layer'
import type { BuildingModel } from '@/features/modeling'

import { Boxes } from '../Boxes'
import { Triangles } from '../Triangles'

interface LayerMeshProps {
  model: BuildingModel
  opacity: number
}

export function RoofCoveringMesh({ model, opacity }: LayerMeshProps) {
  const color = LAYER_DEFINITION_BY_TYPE.roofCovering.color
  const roof = useMemo(
    () => generateRoof(model.dims, model.params.roofCovering, model.elevations.wallTop, color),
    [model.dims, model.params.roofCovering, model.elevations.wallTop, color],
  )
  return (
    <>
      <Boxes boxes={roof.slopes} opacity={opacity} />
      <Triangles triangles={roof.gables} opacity={opacity} />
    </>
  )
}
