import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_BUILDING, type Building } from './types'

const initialState: Building = { ...DEFAULT_BUILDING }

export const buildingSlice = createSlice({
  name: 'building',
  initialState,
  reducers: {
    setLength: (state, action: PayloadAction<number>) => {
      state.length = action.payload
    },
    setWidth: (state, action: PayloadAction<number>) => {
      state.width = action.payload
    },
    setPosition: (state, action: PayloadAction<{ x: number; z: number }>) => {
      state.x = action.payload.x
      state.z = action.payload.z
    },
    setFootprint: (
      state,
      action: PayloadAction<{ length: number; width: number; x: number; z: number }>,
    ) => {
      state.length = action.payload.length
      state.width = action.payload.width
      state.x = action.payload.x
      state.z = action.payload.z
    },
    reset: () => ({ ...DEFAULT_BUILDING }),
  },
})

export const { setLength, setWidth, setPosition, setFootprint, reset } = buildingSlice.actions
export const buildingReducer = buildingSlice.reducer
