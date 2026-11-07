import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const VIEW_PRESETS = ['iso', 'top', 'front', 'side'] as const
export type ViewPreset = (typeof VIEW_PRESETS)[number]

interface ViewState {
  preset: ViewPreset
  /** Счётчик для принудительного сброса камеры. */
  resetNonce: number
}

const initialState: ViewState = { preset: 'iso', resetNonce: 0 }

export const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setPreset: (state, action: PayloadAction<ViewPreset>) => {
      state.preset = action.payload
    },
    resetView: (state) => {
      state.resetNonce += 1
    },
  },
})

export const { setPreset, resetView } = viewSlice.actions
export const viewReducer = viewSlice.reducer
