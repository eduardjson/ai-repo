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
  UpdateStockRequest,
  PriceListItemDto,
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
} from '@shared/types'
import { baseQueryWithReauth } from './base'

export const warehouseApi = createApi({
  reducerPath: 'warehouseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Warehouse', 'Object', 'Shipment', 'Stock', 'PriceList', 'User'],
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
      invalidatesTags: ['Stock', 'PriceList'],
    }),

    updateStock: builder.mutation<StockItemDto, { warehouseId: string; stockId: string; data: UpdateStockRequest }>({
      query: ({ warehouseId, stockId, data }) => ({
        url: `/warehouses/${warehouseId}/stock/${stockId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Stock', 'PriceList'],
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

    getShipment: builder.query<ShipmentDto, string>({
      query: (id) => `/shipments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Shipment', id }],
    }),

    createShipment: builder.mutation<ShipmentDto, CreateShipmentRequest>({
      query: (body) => ({ url: '/shipments', method: 'POST', body }),
      invalidatesTags: ['Shipment', 'Stock', 'PriceList'],
    }),

    updateShipmentStatus: builder.mutation<ShipmentDto, { id: string; data: UpdateShipmentStatusRequest }>({
      query: ({ id, data }) => ({ url: `/shipments/${id}/status`, method: 'PATCH', body: data }),
      invalidatesTags: ['Shipment', 'Stock', 'PriceList'],
    }),

    deleteShipment: builder.mutation<void, string>({
      query: (id) => ({ url: `/shipments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Shipment', 'Stock', 'PriceList'],
    }),

    getUsers: builder.query<UserDto[], void>({
      query: () => '/user/all-users',
      providesTags: ['User'],
    }),

    getUser: builder.query<UserDto, string>({
      query: (id) => `/user/${id}`,
      providesTags: ['User'],
    }),

    createUser: builder.mutation<UserDto, CreateUserRequest>({
      query: (body) => ({ url: '/user', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<UserDto, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({ url: `/user/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/user/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
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
  useUpdateStockMutation,
  useGetObjectsQuery,
  useCreateObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,
  useGetShipmentsQuery,
  useGetShipmentQuery,
  useCreateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useDeleteShipmentMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetPriceListQuery,
} = warehouseApi
