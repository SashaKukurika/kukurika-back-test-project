import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

// ApiTags for swagger to create entity for all users
@ApiTags('Users')
@Controller('users')
export class UsersController {
  // in constructor write all service that we will use
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userCreateDto: UserCreateDto) {
    return this.usersService.create(userCreateDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // name in Get and Param must be the same
  @Get(':userId')
  async findOne(@Param('userId') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(+userId, updateUserDto);
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: string) {
    return this.usersService.remove(+userId);
  }
}
