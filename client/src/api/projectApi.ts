import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './base'
import type { ModuleConfig } from '../routes/constructor/estimate'

export interface ProjectDto {
  id: string
  name: string
  config: ModuleConfig
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  name: string
  config: ModuleConfig
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectDto[], void>({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<ProjectDto, ProjectInput>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<ProjectDto, { id: string } & ProjectInput>({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi
