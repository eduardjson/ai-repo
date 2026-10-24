import { createApi } from '@reduxjs/toolkit/query/react'
import type { StockTransferDto, CreateTransferRequest } from '@shared/types'
import { baseQueryWithReauth } from './base'

export const transferApi = createApi({
  reducerPath: 'transferApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    getTransfers: builder.query<StockTransferDto[], void>({
      query: () => '/transfers',
      providesTags: ['Transfer'],
    }),
    createTransfer: builder.mutation<StockTransferDto, CreateTransferRequest>({
      query: (body) => ({ url: '/transfers', method: 'POST', body }),
      invalidatesTags: ['Transfer'],
    }),
  }),
})

export const { useGetTransfersQuery, useCreateTransferMutation } = transferApi
