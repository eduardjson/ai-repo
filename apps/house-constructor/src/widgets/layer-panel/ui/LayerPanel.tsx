import { Button, Switch } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { LAYER_DEFINITIONS, setActiveLayer, toggleVisible } from '@/entities/layer'
import { setEnabled } from '@/features/show-hidden-layers'

import './LayerPanel.css'

/**
 * Панель слоёв: включение/выключение видимости,
 * выбор активного слоя и режим полупрозрачных скрытых слоёв.
 */
export function LayerPanel() {
  const dispatch = useAppDispatch()
  const activeLayer = useAppSelector((state) => state.layer.activeLayer)
  const visible = useAppSelector((state) => state.layer.visible)
  const ghostEnabled = useAppSelector((state) => state.showHidden.enabled)

  return (
    <aside className="layer-panel">
      <div className="layer-panel__header">
        <h2 className="layer-panel__title">Слои</h2>
      </div>

      <div className="layer-panel__ghost">
        <Switch
          isSelected={ghostEnabled}
          onChange={(isSelected) => dispatch(setEnabled(isSelected))}
          size="sm"
        >
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Скрытые слои — 30%
          </Switch.Content>
        </Switch>
      </div>

      <ul className="layer-list">
        {LAYER_DEFINITIONS.map((def) => {
          const isActive = activeLayer === def.type
          return (
            <li key={def.type} className={`layer-row${isActive ? ' is-active' : ''}`}>
              <Button
                variant="ghost"
                className="layer-row__main"
                onPress={() => dispatch(setActiveLayer(def.type))}
              >
                <span className="layer-row__dot" style={{ background: def.color }} />
                <span className="layer-row__text">
                  <span className="layer-row__label">{def.label}</span>
                  <span className="layer-row__desc">{def.description}</span>
                </span>
              </Button>
              <Switch
                isSelected={visible[def.type]}
                onChange={() => dispatch(toggleVisible(def.type))}
                size="sm"
                aria-label={def.label}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
