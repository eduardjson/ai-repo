import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface FindAllParams {
  page: number
  size: number
  type?: string
  search?: string
  warehouseId?: string
  from?: string
  to?: string
}

const INCLUDE = {
  product: { include: { baseUnit: true }, omit: { imageData: true } },
  warehouse: true,
  object: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } },
}

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindAllParams) {
    const { page, size, type, search, warehouseId, from, to } = params
    const where: any = {}

    if (type) where.type = type
    if (warehouseId) where.warehouseId = warehouseId
    if (search) {
      where.product = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }
    }
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: INCLUDE,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ])

    return {
      items,
      total,
      page,
      size,
      pages: Math.ceil(total / size),
    }
  }
}
