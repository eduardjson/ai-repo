import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryDto } from '../dto/category.response'

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: CategoryDto, isArray: true })
  findAll() {
    return this.categoryService.findTree()
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryDto })
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id)
  }

  @Roles('ADMIN')
  @Post()
  @ApiCreatedResponse({ type: CategoryDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto)
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ type: CategoryDto })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto)
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id)
  }
}
