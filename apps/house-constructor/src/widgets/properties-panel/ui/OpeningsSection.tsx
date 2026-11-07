import { Button, Card, Label, ListBox, NumberField, Select } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveLayer, setVisible } from '@/entities/layer'
import {
  removeOpening,
  selectOpening,
  updateOpening,
  WALL_LABELS,
  type OpeningType,
  type WallIndex,
} from '@/entities/opening'
import { setTool, type ToolId } from '@/features/tools'
import { getPortalContainer } from '@/shared/lib/portal-container'

/** Редактор проёмов окон и дверей (показывается для слоя стен). */
export function OpeningsSection() {
  const dispatch = useAppDispatch()
  const activeLayer = useAppSelector((state) => state.layer.activeLayer)
  const openings = useAppSelector((state) => state.opening.openings)
  const selectedId = useAppSelector((state) => state.opening.selectedOpeningId)

  if (activeLayer !== 'firstFloorWalls') return null

  const selected = openings.find((opening) => opening.id === selectedId) ?? null

  const startAdding = (tool: ToolId) => {
    dispatch(setActiveLayer('firstFloorWalls'))
    dispatch(setVisible({ layer: 'firstFloorWalls', visible: true }))
    dispatch(setTool(tool))
  }

  return (
    <Card variant="transparent">
      <Card.Header className="justify-between">
        <Card.Title>Проёмы</Card.Title>
        <div className="flex gap-2">
          <Button size="sm" onPress={() => startAdding('addWindow')}>
            + Окно
          </Button>
          <Button size="sm" onPress={() => startAdding('addDoor')}>
            + Дверь
          </Button>
        </div>
      </Card.Header>

      <Card.Content className="flex flex-col gap-3">
        {selected ? (
          <>
            <Select
              value={selected.type}
              onChange={(key) => {
                if (typeof key === 'string') {
                  dispatch(updateOpening({ id: selected.id, patch: { type: key as OpeningType } }))
                }
              }}
              fullWidth
            >
              <Label>Тип</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover UNSTABLE_portalContainer={getPortalContainer() ?? undefined}>
                <ListBox>
                  <ListBox.Item id="window" textValue="Окно">
                    Окно
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="door" textValue="Дверь">
                    Дверь
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>

            <Select
              value={String(selected.wall)}
              onChange={(key) => {
                if (typeof key === 'string') {
                  dispatch(
                    updateOpening({
                      id: selected.id,
                      patch: { wall: Number(key) as WallIndex },
                    }),
                  )
                }
              }}
              fullWidth
            >
              <Label>Стена</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover UNSTABLE_portalContainer={getPortalContainer() ?? undefined}>
                <ListBox>
                  {([0, 1, 2, 3] as const).map((wall) => (
                    <ListBox.Item key={wall} id={String(wall)} textValue={WALL_LABELS[wall]}>
                      {WALL_LABELS[wall]}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <NumberField
              value={selected.position}
              onChange={(v) => {
                if (typeof v === 'number') {
                  dispatch(updateOpening({ id: selected.id, patch: { position: v } }))
                }
              }}
              minValue={0}
              maxValue={30}
              step={0.05}
              fullWidth
            >
              <Label>Положение от угла, м</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            <NumberField
              value={selected.width}
              onChange={(v) => {
                if (typeof v === 'number') {
                  dispatch(updateOpening({ id: selected.id, patch: { width: v } }))
                }
              }}
              minValue={0.3}
              maxValue={5}
              step={0.05}
              fullWidth
            >
              <Label>Ширина, м</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            <NumberField
              value={selected.height}
              onChange={(v) => {
                if (typeof v === 'number') {
                  dispatch(updateOpening({ id: selected.id, patch: { height: v } }))
                }
              }}
              minValue={0.3}
              maxValue={4}
              step={0.05}
              fullWidth
            >
              <Label>Высота, м</Label>
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            {selected.type === 'window' ? (
              <NumberField
                value={selected.sill}
                onChange={(v) => {
                  if (typeof v === 'number') {
                    dispatch(updateOpening({ id: selected.id, patch: { sill: v } }))
                  }
                }}
                minValue={0}
                maxValue={3}
                step={0.05}
                fullWidth
              >
                <Label>Низ окна (от пола), м</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
            ) : null}

            <Button variant="danger" onPress={() => dispatch(removeOpening(selected.id))}>
              Удалить проём
            </Button>
          </>
        ) : (
          <p className="properties-hint">
            Проёмы не выбраны. Нажмите «+ Окно» или «+ Дверь» и кликните по стене, либо выберите
            проём в 3D.
          </p>
        )}

        {openings.length > 0 ? (
          <ul className="opening-list">
            {openings.map((opening) => (
              <li
                key={opening.id}
                className={`opening-item${opening.id === selectedId ? ' is-selected' : ''}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="opening-item__main"
                  onPress={() => dispatch(selectOpening(opening.id))}
                >
                  <span className="opening-item__kind">
                    {opening.type === 'window' ? 'Окно' : 'Дверь'}
                  </span>
                  <span className="opening-item__meta">
                    {WALL_LABELS[opening.wall]} · {opening.position.toFixed(2)} м
                  </span>
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  aria-label="Удалить"
                  onPress={() => dispatch(removeOpening(opening.id))}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </Card.Content>
    </Card>
  )
}
