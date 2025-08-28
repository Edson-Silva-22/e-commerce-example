import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from './entities/user.entity';
import { AuthUser, AuthUserType } from '../utils/decorators/auth-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@AuthUser() user: AuthUserType) {
    return await this.usersService.findOne(user.sub);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateMe(@AuthUser() user: AuthUserType, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(user.sub, updateUserDto);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
  
  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
