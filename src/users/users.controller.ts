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
import { CarBrandOrModelDto } from '../common/query/car-brand-model.dto';
import { PublicUserInfoDto } from '../common/query/user.query.dto';
import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUserData } from './interfaces/user.interface';
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
  @UseGuards(AuthGuard())
  @Get(':userId')
  // @Roles('admin')
  // @UseGuards(RolesGuard)
  async findOne(@Param('userId') id: string) {
    return this.usersService.findByIdOrThrow(id);
  }

  @UseGuards(AuthGuard())
  @Patch(':userId')
  async updateUserInfo(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserInfo(userId, updateUserDto);
  }

  @UseGuards(AuthGuard())
  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.usersService.delete(userId);
  }

  @Post('manager')
  async createManager(@Body() data: UserCreateDto) {
    return this.usersService.createManager(data);
  }

  @Post(':userId/brandOrModel')
  async addNewBrandOrModel(
    @Param('userId') userId: string,
    @Query() query: CarBrandOrModelDto,
  ) {
    return await this.usersService.addNewBrandOrModel(userId, query);
  }
}
