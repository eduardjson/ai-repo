import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto.js';
import { ItemsService } from './items.service.js';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto);
  }
}
