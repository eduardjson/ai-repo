import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class WarehouseStockDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  stockValue: number

  @ApiProperty()
  skuCount: number
}

export class MovementTrendPointDto {
  @ApiProperty()
  date: string

  @ApiProperty()
  incoming: number

  @ApiProperty()
  outgoing: number
}

export class TopProductDto {
  @ApiProperty()
  productId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  sku: string

  @ApiProperty()
  unit: string

  @ApiProperty()
  movedQty: number

  @ApiProperty()
  movedValue: number
}

export class LowStockItemDto {
  @ApiProperty()
  productId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  sku: string

  @ApiProperty()
  unit: string

  @ApiProperty()
  quantity: number

  @ApiProperty()
  minStock: number
}

export class DashboardSummaryDto {
  @ApiProperty()
  inventoryValue: number

  @ApiProperty()
  activeProducts: number

  @ApiProperty()
  inStockProducts: number

  @ApiProperty()
  lowStockCount: number

  @ApiProperty()
  outOfStockCount: number

  @ApiProperty()
  pendingShipments: number

  @ApiProperty()
  draftReceipts: number

  @ApiProperty()
  warehousesCount: number

  @ApiProperty()
  objectsCount: number

  @ApiProperty({ type: () => [WarehouseStockDto] })
  warehouses: WarehouseStockDto[]

  @ApiProperty({ type: () => [MovementTrendPointDto] })
  movementTrend: MovementTrendPointDto[]

  @ApiProperty({ type: () => [TopProductDto] })
  topProducts: TopProductDto[]

  @ApiProperty({ type: () => [LowStockItemDto] })
  lowStock: LowStockItemDto[]
}
