import { Button, Card, Label, NumberField } from '@heroui/react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { LAYER_DEFINITION_BY_TYPE, resetLayer, setParam } from '@/entities/layer'

/** Параметры активного слоя (генерируются из описания слоя). */
export function LayerParamsSection() {
  const dispatch = useAppDispatch()
  const activeLayer = useAppSelector((state) => state.layer.activeLayer)
  const params = useAppSelector((state) => state.layer.params[activeLayer])

  const definition = LAYER_DEFINITION_BY_TYPE[activeLayer]

  return (
    <Card variant="transparent">
      <Card.Header className="justify-between">
        <Card.Title>Слой: {definition.label}</Card.Title>
        <Button variant="ghost" size="sm" onPress={() => dispatch(resetLayer(activeLayer))}>
          Сброс
        </Button>
      </Card.Header>
      <Card.Content className="flex flex-col gap-3">
        {definition.paramDefs.map((param) => (
          <NumberField
            key={param.key}
            value={params[param.key]}
            onChange={(v) => {
              if (typeof v === 'number') dispatch(setParam({ layer: activeLayer, key: param.key, value: v }))
            }}
            minValue={param.min}
            maxValue={param.max}
            step={param.step}
            fullWidth
          >
            <Label>
              {param.label}, {param.unit}
            </Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
        ))}
      </Card.Content>
    </Card>
  )
}
