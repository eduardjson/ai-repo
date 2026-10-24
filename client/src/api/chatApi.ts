import { createApi } from '@reduxjs/toolkit/query/react'
import type { MessageDto, CreateMessageRequest, UpdateMessageRequest } from '@shared/types'
import { baseQueryWithReauth } from './base'

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    getMessages: builder.query<MessageDto[], { limit?: number; offset?: number }>({
      query: (params) => ({ url: '/chat/messages', params }),
      providesTags: ['Message'],
    }),

    createMessage: builder.mutation<MessageDto, CreateMessageRequest>({
      query: (body) => ({ url: '/chat/messages', method: 'POST', body }),
      invalidatesTags: ['Message'],
    }),

    updateMessage: builder.mutation<MessageDto, { id: number; data: UpdateMessageRequest }>({
      query: ({ id, data }) => ({ url: `/chat/messages/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Message'],
    }),

    deleteMessage: builder.mutation<void, number>({
      query: (id) => ({ url: `/chat/messages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Message'],
    }),
  }),
})

export const {
  useGetMessagesQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} = chatApi
