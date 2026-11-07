import { configureStore } from '@reduxjs/toolkit'

import { buildingReducer } from '@/entities/building'
import { foundationReducer } from '@/entities/foundation'
import { layerReducer } from '@/entities/layer'
import { openingReducer } from '@/entities/opening'
import { showHiddenReducer } from '@/features/show-hidden-layers'
import { toolsReducer } from '@/features/tools'
import { viewReducer } from '@/features/view'

export const store = configureStore({
  reducer: {
    building: buildingReducer,
    foundation: foundationReducer,
    layer: layerReducer,
    opening: openingReducer,
    showHidden: showHiddenReducer,
    tools: toolsReducer,
    view: viewReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
