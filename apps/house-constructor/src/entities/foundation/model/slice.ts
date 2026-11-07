import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { createId } from '@/shared/lib/id'

import {
  DEFAULT_SLAB_THICKNESS,
  type FoundationJumper,
  type JumperOrientation,
} from './types'

interface JumperMenu {
  jumperId: string
  x: number
  y: number
}

interface FoundationState {
  jumpers: FoundationJumper[]
  selectedJumperId: string | null
  slabEnabled: boolean
  slabThickness: number
  menu: JumperMenu | null
}

const initialState: FoundationState = {
  jumpers: [],
  selectedJumperId: null,
  slabEnabled: false,
  slabThickness: DEFAULT_SLAB_THICKNESS,
  menu: null,
}

export const foundationSlice = createSlice({
  name: 'foundation',
  initialState,
  reducers: {
    addJumper: {
      reducer(state, action: PayloadAction<FoundationJumper>) {
        state.jumpers.push(action.payload)
        state.selectedJumperId = action.payload.id
      },
      prepare(orientation: JumperOrientation, thickness: number) {
        const jumper: FoundationJumper = {
          id: createId('jumper'),
          orientation,
          position: 0,
          thickness,
        }
        return { payload: jumper }
      },
    },
    updateJumper: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Omit<FoundationJumper, 'id'>> }>,
    ) => {
      const { id, patch } = action.payload
      const jumper = state.jumpers.find((item) => item.id === id)
      if (jumper) Object.assign(jumper, patch)
    },
    removeJumper: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.jumpers = state.jumpers.filter((item) => item.id !== id)
      if (state.selectedJumperId === id) state.selectedJumperId = null
      if (state.menu?.jumperId === id) state.menu = null
    },
    selectJumper: (state, action: PayloadAction<string | null>) => {
      state.selectedJumperId = action.payload
    },
    setSlabEnabled: (state, action: PayloadAction<boolean>) => {
      state.slabEnabled = action.payload
    },
    setSlabThickness: (state, action: PayloadAction<number>) => {
      state.slabThickness = action.payload
    },
    openJumperMenu: (state, action: PayloadAction<JumperMenu>) => {
      state.menu = action.payload
      state.selectedJumperId = action.payload.jumperId
    },
    closeJumperMenu: (state) => {
      state.menu = null
    },
  },
})

export const {
  addJumper,
  updateJumper,
  removeJumper,
  selectJumper,
  setSlabEnabled,
  setSlabThickness,
  openJumperMenu,
  closeJumperMenu,
} = foundationSlice.actions
export const foundationReducer = foundationSlice.reducer
