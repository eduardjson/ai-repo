import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitDto } from '../dto/unit.response';

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
export class UnitController {
  constructor(private unitService: UnitService) {}

  @Get()
  @ApiOkResponse({ type: UnitDto, isArray: true })
  findAll() {
    return this.unitService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UnitDto })
  findOne(@Param('id') id: string) {
    return this.unitService.findById(id);
  }

  @Roles('ADMIN')
  @Post()
  @ApiCreatedResponse({ type: UnitDto })
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ type: UnitDto })
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitService.remove(id);
  }
}
