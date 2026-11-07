import { Grid } from '@react-three/drei'

import { useAppSelector } from '@/app/hooks'
import { LAYER_WORK_ELEVATION } from '@/entities/layer'
import { useBuildingModel } from '@/features/modeling'

/**
 * Координатная сетка и оси для активного слоя.
 * Сетка располагается на рабочей отметке слоя и следует за зданием.
 */
export function CoordinateSystem() {
  const model = useBuildingModel()
  const activeLayer = useAppSelector((state) => state.layer.activeLayer)
  const elevation = LAYER_WORK_ELEVATION[activeLayer](model.elevations)

  return (
    <group position={[model.building.x, elevation, model.building.z]}>
      <Grid
        args={[80, 80]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#b7bec5"
        sectionSize={5}
        sectionThickness={1.1}
        sectionColor="#8b949c"
        fadeDistance={60}
        fadeStrength={1.4}
        infiniteGrid
      />
      <axesHelper args={[3]} />
    </group>
  )
}
