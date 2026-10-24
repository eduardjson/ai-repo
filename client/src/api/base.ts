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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = rawBaseQuery(
        { url: '/auth/refresh-tokens', method: 'POST' },
        api,
        extraOptions,
      )
        .then((res) => {
          const data = res.data as { accessToken?: string } | undefined
          if (data?.accessToken) {
            accessToken = data.accessToken
          }
          return res
        })
        .finally(() => {
          refreshPromise = null
        })
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
