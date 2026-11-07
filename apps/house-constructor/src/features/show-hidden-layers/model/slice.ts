import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ShowHiddenState {
  enabled: boolean
}

const initialState: ShowHiddenState = { enabled: false }

export const showHiddenSlice = createSlice({
  name: 'showHidden',
  initialState,
  reducers: {
    setEnabled: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload
    },
    toggle: (state) => {
      state.enabled = !state.enabled
    },
  },
})

export const { setEnabled, toggle } = showHiddenSlice.actions
export const showHiddenReducer = showHiddenSlice.reducer
