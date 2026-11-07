import { BuildingSection } from './BuildingSection'
import { FoundationSection } from './FoundationSection'
import { LayerParamsSection } from './LayerParamsSection'
import { OpeningsSection } from './OpeningsSection'

/**
 * Правая панель: параметры здания, активного слоя и проёмов.
 */
export function PropertiesPanel() {
  return (
    <aside className="properties-panel">
      <div className="properties-panel__header">
        <h2 className="properties-panel__title">Параметры</h2>
      </div>
      <BuildingSection />
      <LayerParamsSection />
      <FoundationSection />
      <OpeningsSection />
    </aside>
  )
}
