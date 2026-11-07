import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { LAYER_DEFINITIONS, LAYER_DEFINITION_BY_TYPE } from './definitions'
import type { LayerType } from './types'

interface LayerState {
  activeLayer: LayerType
  visible: Record<LayerType, boolean>
  params: Record<LayerType, Record<string, number>>
}

function initialVisible(): Record<LayerType, boolean> {
  const acc = {} as Record<LayerType, boolean>
  for (const def of LAYER_DEFINITIONS) acc[def.type] = false
  return acc
}

function initialParams(): Record<LayerType, Record<string, number>> {
  const acc = {} as Record<LayerType, Record<string, number>>
  for (const def of LAYER_DEFINITIONS) acc[def.type] = { ...def.defaultParams }
  return acc
}

const initialState: LayerState = {
  activeLayer: 'foundation',
  visible: initialVisible(),
  params: initialParams(),
}

export const layerSlice = createSlice({
  name: 'layer',
  initialState,
  reducers: {
    setActiveLayer: (state, action: PayloadAction<LayerType>) => {
      state.activeLayer = action.payload
    },
    setVisible: (state, action: PayloadAction<{ layer: LayerType; visible: boolean }>) => {
      state.visible[action.payload.layer] = action.payload.visible
    },
    toggleVisible: (state, action: PayloadAction<LayerType>) => {
      state.visible[action.payload] = !state.visible[action.payload]
    },
    setParam: (
      state,
      action: PayloadAction<{ layer: LayerType; key: string; value: number }>,
    ) => {
      state.params[action.payload.layer][action.payload.key] = action.payload.value
    },
    resetLayer: (state, action: PayloadAction<LayerType>) => {
      state.params[action.payload] = { ...LAYER_DEFINITION_BY_TYPE[action.payload].defaultParams }
    },
  },
})

export const {
  setActiveLayer,
  setVisible,
  toggleVisible,
  setParam,
  resetLayer,
} = layerSlice.actions
export const layerReducer = layerSlice.reducer
