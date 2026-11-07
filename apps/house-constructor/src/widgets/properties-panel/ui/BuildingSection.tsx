import { Card, Label, NumberField } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setLength, setPosition, setWidth } from '@/entities/building'

/** Параметры здания (габариты и положение). */
export function BuildingSection() {
  const dispatch = useAppDispatch()
  const length = useAppSelector((state) => state.building.length)
  const width = useAppSelector((state) => state.building.width)
  const x = useAppSelector((state) => state.building.x)
  const z = useAppSelector((state) => state.building.z)

  return (
    <Card variant="transparent">
      <Card.Header>
        <Card.Title>Здание</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        <NumberField
          value={length}
          onChange={(v) => {
            if (typeof v === 'number') dispatch(setLength(v))
          }}
          minValue={1}
          maxValue={40}
          step={0.1}
          fullWidth
        >
          <Label>Длина (X), м</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        <NumberField
          value={width}
          onChange={(v) => {
            if (typeof v === 'number') dispatch(setWidth(v))
          }}
          minValue={1}
          maxValue={40}
          step={0.1}
          fullWidth
        >
          <Label>Ширина (Z), м</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        <NumberField
          value={x}
          onChange={(v) => {
            if (typeof v === 'number') dispatch(setPosition({ x: v, z }))
          }}
          minValue={-50}
          maxValue={50}
          step={0.1}
          fullWidth
        >
          <Label>Позиция X, м</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>

        <NumberField
          value={z}
          onChange={(v) => {
            if (typeof v === 'number') dispatch(setPosition({ x, z: v }))
          }}
          minValue={-50}
          maxValue={50}
          step={0.1}
          fullWidth
        >
          <Label>Позиция Z, м</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </Card.Content>
    </Card>
  )
}
