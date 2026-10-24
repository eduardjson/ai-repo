// ── Enums ──
export type Role = 'ADMIN' | 'USER'

export type ShipmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export type DocumentType = 'SPECIFICATION' | 'DRAWING' | 'CONTRACT' | 'OTHER'

export type CostType = 'MATERIAL' | 'LABOR'

// ── Auth ──
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  repeatPassword: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface AuthResponse {
  accessToken: string
  user: UserDto
}

// ── User ──
export interface UserDto {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
  role: Role[]
  avatar?: string
  createdAt: string
  updatedAt: string
}

// ── Product ──
export interface ProductDto {
  id: string
  title: string
  description?: string
  category?: string
  manufacturer?: string
  imageUrl?: string
  imageType?: string
  unit?: string
  createdAt: string
  updatedAt: string
}

export interface ProductImageDto {
  id: string
  productId: string
  url: string
}

export interface CreateProductRequest {
  title: string
  description?: string
  category?: string
  manufacturer?: string
  imageUrl?: string
  unit?: string
}

export type UpdateProductRequest = Partial<CreateProductRequest>

// ── Warehouse ──
export interface WarehouseDto {
  id: string
  name: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseRequest {
  name: string
  address?: string
}

export type UpdateWarehouseRequest = Partial<CreateWarehouseRequest>

// ── Stock ──
export interface StockItemDto {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  purchasePrice?: number
  estimatePrice?: number
  salePrice?: number
  discount?: number
  product?: ProductDto
}

export interface AddStockRequest {
  productId: string
  quantity: number
  purchasePrice?: number
  estimatePrice?: number
  salePrice?: number
  discount?: number
}

// ── Object (Construction Site) ──
export interface ObjectDto {
  id: string
  name: string
  address?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateObjectRequest {
  name: string
  address?: string
  description?: string
}

export type UpdateObjectRequest = Partial<CreateObjectRequest>

// ── Shipment ──
export interface ShipmentItemDto {
  id: string
  shipmentId: string
  productId: string
  quantity: number
  product?: ProductDto
}

export interface ShipmentDto {
  id: string
  warehouseId: string
  objectId: string
  status: ShipmentStatus
  createdAt: string
  updatedAt: string
  warehouse?: WarehouseDto
  object?: ObjectDto
  items?: ShipmentItemDto[]
}

export interface CreateShipmentRequest {
  warehouseId: string
  objectId: string
  items: { productId: string; quantity: number }[]
}

export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus
}

// ── Price List ──
export interface PriceListItemDto {
  productId: string
  productTitle: string
  category?: string
  manufacturer?: string
  unit?: string
  quantity: number
  purchasePrice?: number
  estimatePrice?: number
  salePrice?: number
  discount?: number
  warehouseId: string
  warehouseName: string
  firstArrivedAt?: string
}

// ── Dashboard ──
export interface DashboardMetricsDto {
  employeesCount: number
  objectsCount: number
  completedObjectsCount: number
  activeObjectsCount: number
}

// ── Chat ──
export interface MessageDto {
  id: number
  userId: string
  userName: string
  text: string
  createdAt: string
  attachments?: AttachmentDto[]
}

export interface AttachmentDto {
  id: string
  messageId: number
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  uploadedAt: string
}

export interface CreateMessageRequest {
  text: string
}

export interface UpdateMessageRequest {
  text: string
}

// ── Pagination ──
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
  message?: string
  statusCode?: number
}
