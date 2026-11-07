import { useBuildingModel } from '@/features/modeling'
import { useLayerOpacity } from '@/features/show-hidden-layers'

import { FloorSlabMesh } from './layers/FloorSlabMesh'
import { FoundationMesh } from './layers/FoundationMesh'
import { InterfloorSlabMesh } from './layers/InterfloorSlabMesh'
import { RafterSystemMesh } from './layers/RafterSystemMesh'
import { RoofCoveringMesh } from './layers/RoofCoveringMesh'
import { WallsMesh } from './layers/WallsMesh'

/**
 * Собирает все слои дома в одну группу, расположенную в позиции здания.
 * Скрытые слои отображаются полупрозрачно в зависимости от настроек.
 */
export function HouseScene() {
  const model = useBuildingModel()

  const foundationOpacity = useLayerOpacity('foundation')
  const floorSlabOpacity = useLayerOpacity('floorSlab')
  const wallsOpacity = useLayerOpacity('firstFloorWalls')
  const interfloorOpacity = useLayerOpacity('interfloorSlab')
  const rafterOpacity = useLayerOpacity('rafterSystem')
  const roofOpacity = useLayerOpacity('roofCovering')

  return (
    <group position={[model.building.x, 0, model.building.z]}>
      {foundationOpacity > 0 && <FoundationMesh model={model} opacity={foundationOpacity} />}
      {floorSlabOpacity > 0 && <FloorSlabMesh model={model} opacity={floorSlabOpacity} />}
      {wallsOpacity > 0 && <WallsMesh model={model} opacity={wallsOpacity} />}
      {interfloorOpacity > 0 && <InterfloorSlabMesh model={model} opacity={interfloorOpacity} />}
      {rafterOpacity > 0 && <RafterSystemMesh model={model} opacity={rafterOpacity} />}
      {roofOpacity > 0 && <RoofCoveringMesh model={model} opacity={roofOpacity} />}
    </group>
  )
}
