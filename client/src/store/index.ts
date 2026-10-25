import { configureStore } from '@reduxjs/toolkit'
import { emptySplitApi } from '../api/emptyApi'
import authReducer from './authSlice'
import filterReducer from './filterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    [emptySplitApi.reducerPath]: emptySplitApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emptySplitApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
