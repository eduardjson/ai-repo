import { Controller, Get, Patch, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles('ADMIN')
  @Get('all-users')
  async findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as any;
    return this.userService.findById(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }
}
