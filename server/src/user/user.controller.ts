import { Controller, Get, Post, Patch, Delete, Param, Body, Req, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../auth/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from '../dto/user.response';

interface AuthenticatedUser {
  id: string;
  role?: string[];
}

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles('ADMIN')
  @Get('all-users')
  @ApiOkResponse({ type: UserDto, isArray: true })
  async findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOkResponse({ type: UserDto })
  async getMe(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.userService.findById(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    // Просмотр чужого профиля разрешён только администратору.
    if (user.id !== id && !user.role?.includes('ADMIN')) {
      throw new ForbiddenException('Нет доступа к профилю другого пользователя');
    }
    return this.userService.findById(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOkResponse({ type: UserDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: UserDto })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
