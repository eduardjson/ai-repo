import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './base'

// Пустой api, в который кодогенератор инжектит endpoint'ы из OpenAPI-спеки.
// tagTypes должны совпадать с тегами OpenAPI (генерируются из @ApiTags).
export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['auth', 'user', 'products', 'warehouses', 'objects', 'shipments', 'chat', 'projects', 'transfers'],
  endpoints: () => ({}),
})
