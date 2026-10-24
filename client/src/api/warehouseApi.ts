import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  WarehouseDto,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  ObjectDto,
  CreateObjectRequest,
  UpdateObjectRequest,
  ShipmentDto,
  CreateShipmentRequest,
  UpdateShipmentStatusRequest,
  StockItemDto,
  AddStockRequest,
  PriceListItemDto,
  UserDto,
} from '@shared/types'
import { baseQueryWithReauth } from './base'

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Warehouse', 'Object', 'Shipment', 'Stock', 'PriceList'],
  endpoints: (builder) => ({
    getWarehouses: builder.query<WarehouseDto[], void>({
      query: () => '/warehouses',
      providesTags: ['Warehouse'],
    }),

    createWarehouse: builder.mutation<WarehouseDto, CreateWarehouseRequest>({
      query: (body) => ({ url: '/warehouses', method: 'POST', body }),
      invalidatesTags: ['Warehouse'],
    }),

    updateWarehouse: builder.mutation<WarehouseDto, { id: string; data: UpdateWarehouseRequest }>({
      query: ({ id, data }) => ({ url: `/warehouses/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Warehouse'],
    }),

    deleteWarehouse: builder.mutation<void, string>({
      query: (id) => ({ url: `/warehouses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Warehouse'],
    }),

    getStock: builder.query<StockItemDto[], string>({
      query: (warehouseId) => `/warehouses/${warehouseId}/stock`,
      providesTags: ['Stock'],
    }),

    addStock: builder.mutation<StockItemDto, { warehouseId: string; data: AddStockRequest }>({
      query: ({ warehouseId, data }) => ({
        url: `/warehouses/${warehouseId}/stock`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Stock'],
    }),

    getObjects: builder.query<ObjectDto[], void>({
      query: () => '/objects',
      providesTags: ['Object'],
    }),

    createObject: builder.mutation<ObjectDto, CreateObjectRequest>({
      query: (body) => ({ url: '/objects', method: 'POST', body }),
      invalidatesTags: ['Object'],
    }),

    updateObject: builder.mutation<ObjectDto, { id: string; data: UpdateObjectRequest }>({
      query: ({ id, data }) => ({ url: `/objects/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Object'],
    }),

    deleteObject: builder.mutation<void, string>({
      query: (id) => ({ url: `/objects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Object'],
    }),

    getShipments: builder.query<ShipmentDto[], { objectId?: string; warehouseId?: string }>({
      query: (params) => ({ url: '/shipments', params }),
      providesTags: ['Shipment'],
    }),

    createShipment: builder.mutation<ShipmentDto, CreateShipmentRequest>({
      query: (body) => ({ url: '/shipments', method: 'POST', body }),
      invalidatesTags: ['Shipment'],
    }),

    updateShipmentStatus: builder.mutation<ShipmentDto, { id: string; data: UpdateShipmentStatusRequest }>({
      query: ({ id, data }) => ({ url: `/shipments/${id}/status`, method: 'PATCH', body: data }),
      invalidatesTags: ['Shipment'],
    }),

    getUsers: builder.query<UserDto[], void>({
      query: () => '/user/all-users',
    }),

    getUser: builder.query<UserDto, string>({
      query: (id) => `/user/${id}`,
    }),

    getPriceList: builder.query<PriceListItemDto[], { warehouseId?: string; category?: string; manufacturer?: string } | void>({
      query: (params) => {
        if (params && 'warehouseId' in params && params.warehouseId) {
          return `/warehouses/${params.warehouseId}/price-list`
        }
        return '/warehouses/price-lists/all'
      },
      providesTags: ['PriceList'],
    }),
  }),
})

export const {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetStockQuery,
  useAddStockMutation,
  useGetObjectsQuery,
  useCreateObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,
  useGetShipmentsQuery,
  useCreateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useGetPriceListQuery,
} = warehouseApi
