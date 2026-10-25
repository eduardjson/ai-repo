import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { clearUser } from '../store/authSlice'

// Access token lives in memory only (not localStorage, not a cookie) to avoid
// both XSS and CSRF. The refresh token stays in an httpOnly cookie.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return headers
  },
})

// Single-flight: coalesce concurrent 401s into a single refresh request so we
// never fire multiple parallel token rotations.
let refreshPromise: Promise<any> | null = null

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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await rawBaseQuery(
            { url: '/auth/refresh-tokens', method: 'POST' },
            api,
            extraOptions,
          )
          const data = res.data as { accessToken?: string } | undefined
          if (data?.accessToken) {
            accessToken = data.accessToken
          }
          return res
        } finally {
          refreshPromise = null
        }
      })()
    }

    const refreshResult = await refreshPromise

    if (!refreshResult.error) {
      // Retry the original request with the freshly issued access token.
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      accessToken = null
      api.dispatch(clearUser())
    }
  }

  return result
}
