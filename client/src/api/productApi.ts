import { createApi } from '@reduxjs/toolkit/query/react'
import type {
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
  ProductImageDto,
  PaginatedResponse,
} from '@shared/types'
import { baseQueryWithReauth } from './base'

interface GetProductsParams {
  page?: number
  size?: number
  search?: string
  category?: string
  manufacturer?: string
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<ProductDto>, GetProductsParams>({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),

    getProduct: builder.query<ProductDto, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<ProductDto, CreateProductRequest | FormData>({
      query: (body) => {
        if (body instanceof FormData) {
          return { url: '/products', method: 'POST', body }
        }
        return { url: '/products', method: 'POST', body }
      },
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation<ProductDto, { id: string; data: UpdateProductRequest | FormData }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    uploadProductImage: builder.mutation<ProductImageDto, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/products/${id}/images`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productApi
