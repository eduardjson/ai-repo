import { useMemo } from 'react'

import { useAppSelector } from '@/app/hooks'
import type { Building, BuildingDims } from '@/entities/building'
import type { FoundationJumper } from '@/entities/foundation'
import { computeElevations, type Elevations, type LayerType } from '@/entities/layer'
import type { Opening } from '@/entities/opening'

export interface BuildingModel {
  building: Building
  dims: BuildingDims
  params: Record<LayerType, Record<string, number>>
  elevations: Elevations
  openings: Opening[]
  jumpers: FoundationJumper[]
  slabEnabled: boolean
  slabThickness: number
}

/**
 * Собирает все исходные данные модели здания из сторов
 * в один мемоизированный объект для генераторов геометрии и 3D-сцены.
 */
export function useBuildingModel(): BuildingModel {
  const building = useAppSelector((state) => state.building)
  const params = useAppSelector((state) => state.layer.params)
  const openings = useAppSelector((state) => state.opening.openings)
  const jumpers = useAppSelector((state) => state.foundation.jumpers)
  const slabEnabled = useAppSelector((state) => state.foundation.slabEnabled)
  const slabThickness = useAppSelector((state) => state.foundation.slabThickness)

  return useMemo(() => {
    const dims: BuildingDims = { length: building.length, width: building.width }
    return {
      building,
      dims,
      params,
      elevations: computeElevations(params, params.foundation.height ?? 0.5),
      openings,
      jumpers,
      slabEnabled,
      slabThickness,
    }
  }, [building, params, openings, jumpers, slabEnabled, slabThickness])
}
