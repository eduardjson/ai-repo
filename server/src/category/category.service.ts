import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /** Возвращает дерево категорий (вложенность через children). */
  async findTree() {
    const all = await this.prisma.category.findMany({ orderBy: { name: 'asc' } })
    return this.buildTree(all)
  }

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } })
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    })
    if (!category) {
      throw new NotFoundException('Категория не найдена')
    }
    return category
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.findById(dto.parentId)
    }
    return this.prisma.category.create({ data: dto })
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id)
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Категория не может быть родителем самой себя')
      }
      await this.findById(dto.parentId)
    }
    return this.prisma.category.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findById(id)
    const children = await this.prisma.category.count({ where: { parentId: id } })
    if (children > 0) {
      throw new BadRequestException('Сначала удалите или перенесите дочерние категории')
    }
    const productCount = await this.prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      throw new BadRequestException('Категория используется в номенклатуре и не может быть удалена')
    }
    return this.prisma.category.delete({ where: { id } })
  }

  private buildTree(categories: any[]): any[] {
    const map = new Map<string, any>()
    for (const c of categories) {
      map.set(c.id, { ...c, children: [] })
    }
    const roots: any[] = []
    for (const c of map.values()) {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).children.push(c)
      } else {
        roots.push(c)
      }
    }
    return roots
  }
}
