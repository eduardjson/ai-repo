import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { createId } from '@/shared/lib/id'

import {
  DEFAULT_OPENING_DIMS,
  type Opening,
  type OpeningType,
  type WallIndex,
} from './types'

interface OpeningState {
  openings: Opening[]
  selectedOpeningId: string | null
}

const initialState: OpeningState = {
  openings: [],
  selectedOpeningId: null,
}

export const openingSlice = createSlice({
  name: 'opening',
  initialState,
  reducers: {
    addOpening: {
      reducer(state, action: PayloadAction<Opening>) {
        state.openings.push(action.payload)
        state.selectedOpeningId = action.payload.id
      },
      prepare(wall: WallIndex, position: number, type: OpeningType) {
        const dims = DEFAULT_OPENING_DIMS[type]
        const opening: Opening = { id: createId(type), type, wall, position, ...dims }
        return { payload: opening }
      },
    },
    updateOpening: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Omit<Opening, 'id'>> }>,
    ) => {
      const { id, patch } = action.payload
      const opening = state.openings.find((item) => item.id === id)
      if (opening) Object.assign(opening, patch)
    },
    removeOpening: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.openings = state.openings.filter((item) => item.id !== id)
      if (state.selectedOpeningId === id) state.selectedOpeningId = null
    },
    selectOpening: (state, action: PayloadAction<string | null>) => {
      state.selectedOpeningId = action.payload
    },
  },
})

export const { addOpening, updateOpening, removeOpening, selectOpening } = openingSlice.actions
export const openingReducer = openingSlice.reducer
