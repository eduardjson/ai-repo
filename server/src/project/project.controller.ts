import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.projectService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.projectService.findOne(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request, @Body() dto: CreateProjectDto) {
    const user = req.user as { id: string };
    return this.projectService.create(user.id, dto.name, dto.config);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const user = req.user as { id: string };
    return this.projectService.update(id, user.id, dto.name, dto.config);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.projectService.remove(id, user.id);
  }
}
