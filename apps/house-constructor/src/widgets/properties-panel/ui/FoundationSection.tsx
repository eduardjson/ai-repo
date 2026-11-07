import { Button, Card, Label, NumberField, Switch } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveLayer, setVisible } from '@/entities/layer'
import {
  addJumper,
  computeConcreteVolume,
  removeJumper,
  selectJumper,
  setSlabEnabled,
  setSlabThickness,
  type JumperOrientation,
} from '@/entities/foundation'

/** Редактор фундамента: плитный фундамент, перемычки и объём бетона. */
export function FoundationSection() {
  const dispatch = useAppDispatch()
  const activeLayer = useAppSelector((state) => state.layer.activeLayer)
  const building = useAppSelector((state) => state.building)
  const params = useAppSelector((state) => state.layer.params.foundation)
  const jumpers = useAppSelector((state) => state.foundation.jumpers)
  const selectedId = useAppSelector((state) => state.foundation.selectedJumperId)
  const slabEnabled = useAppSelector((state) => state.foundation.slabEnabled)
  const slabThickness = useAppSelector((state) => state.foundation.slabThickness)

  if (activeLayer !== 'foundation') return null

  const volume = computeConcreteVolume(
    { length: building.length, width: building.width },
    params,
    jumpers,
    slabEnabled,
    slabThickness,
  )

  const add = (orientation: JumperOrientation) => {
    dispatch(setActiveLayer('foundation'))
    dispatch(setVisible({ layer: 'foundation', visible: true }))
    dispatch(addJumper(orientation, params.thickness ?? 0.4))
  }

  return (
    <Card variant="transparent">
      <Card.Header>
        <Card.Title>Перемычки и плита</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <Switch isSelected={slabEnabled} onChange={(v) => dispatch(setSlabEnabled(v))} size="sm">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            Плитный фундамент
          </Switch.Content>
        </Switch>

        {slabEnabled ? (
          <NumberField
            value={slabThickness}
            onChange={(v) => {
              if (typeof v === 'number') dispatch(setSlabThickness(v))
            }}
            minValue={0.05}
            maxValue={0.5}
            step={0.01}
            fullWidth
          >
            <Label>Толщина плиты, м</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        ) : null}

        <div className="foundation-volume">Бетон: {volume.toFixed(2)} м³</div>

        <div className="flex gap-2">
          <Button size="sm" onPress={() => add('along')}>
            + Продольная
          </Button>
          <Button size="sm" onPress={() => add('across')}>
            + Поперечная
          </Button>
        </div>

        <p className="properties-hint">ПКМ по перемычке в 3D — настроить её положение и ширину.</p>

        {jumpers.length > 0 ? (
          <ul className="opening-list">
            {jumpers.map((jumper) => (
              <li
                key={jumper.id}
                className={`opening-item${jumper.id === selectedId ? ' is-selected' : ''}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="opening-item__main"
                  onPress={() => dispatch(selectJumper(jumper.id))}
                >
                  <span className="opening-item__kind">
                    {jumper.orientation === 'along' ? 'Продольная' : 'Поперечная'}
                  </span>
                  <span className="opening-item__meta">
                    поз. {jumper.position.toFixed(2)} м · {jumper.thickness.toFixed(2)} м
                  </span>
                </Button>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  aria-label="Удалить"
                  onPress={() => dispatch(removeJumper(jumper.id))}
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
