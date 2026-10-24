import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { clearUser } from '../store/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh-tokens', method: 'GET' },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(clearUser())
      localStorage.removeItem('access_token')
    }
  }

  return result
}
