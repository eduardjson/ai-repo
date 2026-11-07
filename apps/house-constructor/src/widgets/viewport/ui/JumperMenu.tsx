import { useEffect } from 'react'
import { Button, Label, NumberField } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { closeJumperMenu, removeJumper, updateJumper } from '@/entities/foundation'

const MENU_WIDTH = 260
const MENU_HEIGHT = 260

/**
 * Контекстное меню настройки перемычки — открывается по правому клику
 * по перемычке в 3D и показывает поля положения и ширины ленты.
 */
export function JumperMenu() {
  const dispatch = useAppDispatch()
  const menu = useAppSelector((state) => state.foundation.menu)
  const jumpers = useAppSelector((state) => state.foundation.jumpers)
  const building = useAppSelector((state) => state.building)

  useEffect(() => {
    if (!menu) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(closeJumperMenu())
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menu, dispatch])

  if (!menu) return null

  const jumper = jumpers.find((item) => item.id === menu.jumperId)
  if (!jumper) return null

  const halfRange = jumper.orientation === 'along' ? building.width / 2 : building.length / 2
  const left = Math.max(8, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 8))
  const top = Math.max(8, Math.min(menu.y, window.innerHeight - MENU_HEIGHT - 8))
  const orientationLabel = jumper.orientation === 'along' ? 'продольная' : 'поперечная'

  return (
    <>
      <div className="jumper-menu__backdrop" onClick={() => dispatch(closeJumperMenu())} />
      <div className="jumper-menu" style={{ left, top }}>
        <div className="jumper-menu__header">
          <span className="jumper-menu__title">Перемычка · {orientationLabel}</span>
        </div>
        <div className="jumper-menu__body">
          <NumberField
            value={jumper.position}
            onChange={(v) => {
              if (typeof v === 'number') {
                dispatch(updateJumper({ id: jumper.id, patch: { position: v } }))
              }
            }}
            minValue={-halfRange}
            maxValue={halfRange}
            step={0.05}
            fullWidth
          >
            <Label>Положение, м</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <NumberField
            value={jumper.thickness}
            onChange={(v) => {
              if (typeof v === 'number') {
                dispatch(updateJumper({ id: jumper.id, patch: { thickness: v } }))
              }
            }}
            minValue={0.2}
            maxValue={1.0}
            step={0.05}
            fullWidth
          >
            <Label>Ширина ленты, м</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <Button
            variant="danger"
            size="sm"
            fullWidth
            onPress={() => dispatch(removeJumper(jumper.id))}
          >
            Удалить перемычку
          </Button>
        </div>
      </div>
    </>
  )
}
