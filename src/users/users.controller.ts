import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import {
  ApiPaginatedResponse,
  PaginatedDto,
} from '../common/pagination/response';
import { PublicUserInfoDto } from '../common/query/user.query.dto';
import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserData } from './interface/user.interface';
import { UsersService } from './users.service';

// @UseGuards(AuthGuard()) it will work for full controller
// ApiTags for swagger to create entity for all users
@ApiTags('Users')
@ApiExtraModels(PublicUserData, PaginatedDto)
@Controller('users')
export class UsersController {
  // in constructor write all service that we will use
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() data: UserCreateDto) {
    return this.usersService.login(data);
  }
  @Post('register')
  async register(@Body() data: UserCreateDto) {
    return this.usersService.register(data);
  }

  @UseGuards(AuthGuard())
  @ApiPaginatedResponse('entities', PublicUserData)
  @Get()
  async findAll(@Query() query: PublicUserInfoDto) {
    return this.usersService.findAll(query);
  }

  // name in Get and Param must be the same
  @Get(':userId')
  // @UseGuards(RolesGuard)
  // @Roles('admin', 'user')
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
