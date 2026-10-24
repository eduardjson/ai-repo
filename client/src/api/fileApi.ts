import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './base'

export const fileApi = createApi({
  reducerPath: 'fileApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    downloadFile: builder.query<Blob, string>({
      query: (filePath) => ({
        url: `/files/download?path=${encodeURIComponent(filePath)}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const { useDownloadFileQuery } = fileApi
