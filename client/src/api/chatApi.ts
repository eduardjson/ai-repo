import { createApi } from '@reduxjs/toolkit/query/react'
import type { MessageDto, UpdateMessageRequest } from '@shared/types'
import { baseQueryWithReauth, getAccessToken } from './base'

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    getMessages: builder.query<MessageDto[], { limit?: number; offset?: number }>({
      query: (params) => ({ url: '/chat/messages', params }),
      providesTags: ['Message'],
    }),

    createMessage: builder.mutation<MessageDto, FormData>({
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

/** Скачивание вложения (PDF) с авторизацией и сохранением под оригинальным именем. */
export async function downloadAttachment(messageId: number, attachmentId: string, fileName: string) {
  const res = await fetch(`/api/chat/messages/${messageId}/attachments/${attachmentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })
  if (!res.ok) {
    throw new Error(`Не удалось скачать файл (${res.status})`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
