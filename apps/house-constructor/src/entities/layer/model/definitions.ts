import type { LayerDefinition, LayerType } from './types'

/**
 * Описание всех слоёв конструкции дома — единый источник правды
 * для панели слоёв, панели свойств и генераторов геометрии.
 */
export const LAYER_DEFINITIONS: LayerDefinition[] = [
  {
    type: 'foundation',
    label: 'Фундамент',
    description: 'Ленточный фундамент по периметру',
    order: 0,
    color: '#8f9aa5',
    paramDefs: [
      { key: 'thickness', label: 'Ширина ленты', unit: 'м', min: 0.2, max: 1.0, step: 0.05 },
      { key: 'depth', label: 'Заглубление', unit: 'м', min: 0.2, max: 2.0, step: 0.05 },
      { key: 'height', label: 'Цоколь (над землёй)', unit: 'м', min: 0.1, max: 1.5, step: 0.05 },
    ],
    defaultParams: { thickness: 0.4, depth: 0.6, height: 0.5 },
  },
  {
    type: 'floorSlab',
    label: 'Перекрытие пола',
    description: 'Плита пола первого этажа',
    order: 1,
    color: '#b7c0c7',
    paramDefs: [
      { key: 'thickness', label: 'Толщина плиты', unit: 'м', min: 0.1, max: 0.5, step: 0.01 },
    ],
    defaultParams: { thickness: 0.2 },
  },
  {
    type: 'firstFloorWalls',
    label: 'Стены 1-го этажа',
    description: 'Несущие стены и проёмы',
    order: 2,
    color: '#d9c39a',
    paramDefs: [
      { key: 'thickness', label: 'Толщина стены', unit: 'м', min: 0.1, max: 0.6, step: 0.01 },
      { key: 'height', label: 'Высота стен', unit: 'м', min: 2.4, max: 4.5, step: 0.1 },
    ],
    defaultParams: { thickness: 0.3, height: 3.0 },
  },
  {
    type: 'interfloorSlab',
    label: 'Перекрытие',
    description: 'Межэтажное перекрытие',
    order: 3,
    color: '#b7c0c7',
    paramDefs: [
      { key: 'thickness', label: 'Толщина плиты', unit: 'м', min: 0.1, max: 0.5, step: 0.01 },
    ],
    defaultParams: { thickness: 0.2 },
  },
  {
    type: 'rafterSystem',
    label: 'Стропильная система',
    description: 'Каркас кровли',
    order: 4,
    color: '#a9744f',
    paramDefs: [
      { key: 'spacing', label: 'Шаг стропил', unit: 'м', min: 0.3, max: 1.2, step: 0.05 },
      { key: 'sectionWidth', label: 'Сечение · ширина', unit: 'м', min: 0.05, max: 0.3, step: 0.01 },
      { key: 'sectionHeight', label: 'Сечение · высота', unit: 'м', min: 0.05, max: 0.3, step: 0.01 },
      { key: 'rise', label: 'Подъём крыши', unit: 'м', min: 0.3, max: 3.0, step: 0.1 },
      { key: 'overhang', label: 'Свес', unit: 'м', min: 0, max: 1.0, step: 0.05 },
    ],
    defaultParams: { spacing: 0.6, sectionWidth: 0.1, sectionHeight: 0.15, rise: 1.5, overhang: 0.4 },
  },
  {
    type: 'roofCovering',
    label: 'Покрытие кровли',
    description: 'Кровельное покрытие',
    order: 5,
    color: '#8c5a3c',
    paramDefs: [
      { key: 'thickness', label: 'Толщина покрытия', unit: 'м', min: 0.01, max: 0.2, step: 0.005 },
      { key: 'rise', label: 'Подъём крыши', unit: 'м', min: 0.3, max: 3.0, step: 0.1 },
      { key: 'overhang', label: 'Свес', unit: 'м', min: 0, max: 1.0, step: 0.05 },
    ],
    defaultParams: { thickness: 0.05, rise: 1.5, overhang: 0.45 },
  },
]

export const LAYER_DEFINITION_BY_TYPE = Object.fromEntries(
  LAYER_DEFINITIONS.map((def) => [def.type, def]),
) as Record<LayerType, LayerDefinition>
