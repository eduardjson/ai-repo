import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'
import { productApi } from '../api/productApi'
import { warehouseApi } from '../api/warehouseApi'
import { chatApi } from '../api/chatApi'
import { fileApi } from '../api/fileApi'
import { projectApi } from '../api/projectApi'
import { transferApi } from '../api/transferApi'
import authReducer from './authSlice'
import filterReducer from './filterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    filter: filterReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [transferApi.reducerPath]: transferApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productApi.middleware,
      warehouseApi.middleware,
      chatApi.middleware,
      fileApi.middleware,
      projectApi.middleware,
      transferApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
