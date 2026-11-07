import { LayerPanel } from '@/widgets/layer-panel'
import { PropertiesPanel } from '@/widgets/properties-panel'
import { Toolbar } from '@/widgets/toolbar'
import { Viewport } from '@/widgets/viewport'

import './BuilderPage.css'

export function BuilderPage() {
  return (
    <div className="builder-page">
      <Toolbar />
      <div className="builder-page__body">
        <LayerPanel />
        <Viewport />
        <PropertiesPanel />
      </div>
    </div>
  )
}
