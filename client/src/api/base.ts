import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { clearUser } from '../store/authSlice'

// Tokens live in httpOnly cookies (not localStorage), so we only need to
// send credentials and let the browser attach the cookies.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
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
      ).finally(() => {
        refreshPromise = null
      })
    }

    const refreshResult = await refreshPromise

    if (!refreshResult.error) {
      // Retry the original request with the freshly-set access cookie.
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(clearUser())
    }
  }

  return result
}
