import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { ObjectService } from './object.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Controller('objects')
export class ObjectController {
  constructor(private objectService: ObjectService) {}

  @Get()
  findAll() {
    return this.objectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectService.findById(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateObjectDto) {
    return this.objectService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateObjectDto>) {
    return this.objectService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objectService.remove(id);
  }
}
