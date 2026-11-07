import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const TOOL_IDS = ['select', 'addWindow', 'addDoor', 'drawFootprint'] as const
export type ToolId = (typeof TOOL_IDS)[number]

interface ToolsState {
  tool: ToolId
}

const initialState: ToolsState = { tool: 'select' }

export const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    setTool: (state, action: PayloadAction<ToolId>) => {
      state.tool = action.payload
    },
  },
})

export const { setTool } = toolsSlice.actions
export const toolsReducer = toolsSlice.reducer
