import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectService } from './object.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { ObjectDto } from '../dto/object.response';

@ApiTags('objects')
@ApiBearerAuth()
@Controller('objects')
export class ObjectController {
  constructor(private objectService: ObjectService) {}

  @Get()
  @ApiOkResponse({ type: ObjectDto, isArray: true })
  findAll() {
    return this.objectService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ObjectDto })
  findOne(@Param('id') id: string) {
    return this.objectService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ObjectDto })
  create(@Body() dto: CreateObjectDto) {
    return this.objectService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ObjectDto })
  update(@Param('id') id: string, @Body() dto: UpdateObjectDto) {
    return this.objectService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objectService.remove(id);
  }
}
