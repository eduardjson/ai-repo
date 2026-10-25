export const API_BASE_URL = '/api'

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh-tokens',
  LOGOUT: '/auth/logout',
  ME: '/user/me',
} as const

export const USER_ENDPOINTS = {
  BASE: '/user',
  ALL: '/user/all-users',
  BY_ID: (id: string) => `/user/${id}`,
  FIND_BY_EMAIL: (email: string) => `/user/find-by-email/${email}`,
} as const

export const PRODUCTS_ENDPOINTS = {
  BASE: '/products',
  BY_ID: (id: string) => `/products/${id}`,
  IMAGES: (id: string) => `/products/${id}/images`,
} as const

export const WAREHOUSES_ENDPOINTS = {
  BASE: '/warehouses',
  BY_ID: (id: string) => `/warehouses/${id}`,
  STOCK: (id: string) => `/warehouses/${id}/stock`,
  PRICE_LISTS_ALL: '/warehouses/price-lists/all',
  PRICE_LIST: (id: string) => `/warehouses/${id}/price-list`,
} as const

export const OBJECTS_ENDPOINTS = {
  BASE: '/objects',
  BY_ID: (id: string) => `/objects/${id}`,
} as const

export const SHIPMENTS_ENDPOINTS = {
  BASE: '/shipments',
  BY_ID: (id: string) => `/shipments/${id}`,
  STATUS: (id: string) => `/shipments/${id}/status`,
  BY_OBJECT: (objectId: string) => `/shipments/by-object/${objectId}`,
  BY_WAREHOUSE: (warehouseId: string) => `/shipments/by-warehouse/${warehouseId}`,
} as const

export const ATTACHMENTS_ENDPOINTS = {
  BASE: '/attachments',
  BY_ID: (id: string) => `/attachments/${id}`,
  UPLOAD: '/attachments/upload',
} as const

export const ACCESS_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refreshToken'

export const ACCESS_TOKEN_EXPIRE_MINUTES = 15
export const REFRESH_TOKEN_EXPIRE_DAYS = 30

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
} as const
