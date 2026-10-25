import { createApi } from '@reduxjs/toolkit/query/react'
import type { LoginRequest, AuthResponse, UserDto } from '@shared/types'
import { baseQueryWithReauth, setAccessToken } from './base'
import { setUser, clearUser } from '../store/authSlice'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          setAccessToken(data.accessToken)
          dispatch(setUser(data.user))
        } catch {
          /* handled by component */
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          setAccessToken(null)
          dispatch(clearUser())
        }
      },
    }),

    getMe: builder.query<UserDto, void>({
      query: () => '/user/me',
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi
