import { Button, Tabs } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveLayer, setVisible } from '@/entities/layer'
import { setTool, type ToolId } from '@/features/tools'
import { resetView, setPreset, VIEW_PRESETS, type ViewPreset } from '@/features/view'

import './Toolbar.css'

const TOOL_OPTIONS: { value: ToolId; label: string }[] = [
  { value: 'select', label: 'Выбрать' },
  { value: 'drawFootprint', label: 'Контур' },
  { value: 'addWindow', label: 'Окно' },
  { value: 'addDoor', label: 'Дверь' },
]

const VIEW_LABELS: Record<ViewPreset, string> = {
  iso: '3D',
  top: 'Сверху',
  front: 'Фасад',
  side: 'Бок',
}

/** Верхняя панель: инструменты мыши и виды камеры. */
export function Toolbar() {
  const dispatch = useAppDispatch()
  const tool = useAppSelector((state) => state.tools.tool)
  const preset = useAppSelector((state) => state.view.preset)

  const chooseTool = (next: ToolId) => {
    if (next === 'addWindow' || next === 'addDoor') {
      dispatch(setActiveLayer('firstFloorWalls'))
      dispatch(setVisible({ layer: 'firstFloorWalls', visible: true }))
    } else if (next === 'drawFootprint') {
      dispatch(setActiveLayer('foundation'))
      dispatch(setVisible({ layer: 'foundation', visible: true }))
    }
    dispatch(setTool(next))
  }

  return (
    <div className="toolbar">
      <Tabs selectedKey={tool} onSelectionChange={(key) => chooseTool(key as ToolId)}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Инструменты">
            {TOOL_OPTIONS.map((option) => (
              <Tabs.Tab key={option.value} id={option.value}>
                {option.label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <div className="toolbar__spacer" />

      <div className="toolbar__views">
        {VIEW_PRESETS.map((view) => (
          <Button
            key={view}
            variant={preset === view ? 'secondary' : 'ghost'}
            size="sm"
            onPress={() => dispatch(setPreset(view))}
          >
            {VIEW_LABELS[view]}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onPress={() => dispatch(resetView())}>
          Сброс камеры
        </Button>
      </div>
    </div>
  )
}
