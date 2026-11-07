import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { ManufacturerService } from './manufacturer.service'
import { CreateManufacturerDto } from './dto/create-manufacturer.dto'
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto'
import { ManufacturerDto } from '../dto/manufacturer.response'

@ApiTags('manufacturers')
@ApiBearerAuth()
@Controller('manufacturers')
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) {}

  @Get()
  @ApiOkResponse({ type: ManufacturerDto, isArray: true })
  findAll() {
    return this.manufacturerService.findAll()
  }

  @Get(':id')
  @ApiOkResponse({ type: ManufacturerDto })
  findOne(@Param('id') id: string) {
    return this.manufacturerService.findById(id)
  }

  @Roles('ADMIN')
  @Post()
  @ApiCreatedResponse({ type: ManufacturerDto })
  create(@Body() dto: CreateManufacturerDto) {
    return this.manufacturerService.create(dto)
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ type: ManufacturerDto })
  update(@Param('id') id: string, @Body() dto: UpdateManufacturerDto) {
    return this.manufacturerService.update(id, dto)
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manufacturerService.remove(id)
  }
}
