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
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';

import { Role } from '../auth/decorators/role';
import { UserRole } from '../auth/enums/user-role.enum';
import { AccessTokenGuard } from '../auth/guard/access-token.guard';
import { RoleGuard } from '../auth/guard/authorization.guard';
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

  @ApiPaginatedResponse('entities', PublicUserData)
  @Get()
  async findAll(@Query() query: PublicUserInfoDto) {
    return this.usersService.findAll(query);
  }

  // name in Get and Param must be the same
  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get(':userId')
  // @Roles('admin')
  // @UseGuards(RolesGuard)
  async findOne(@Param('userId') id: string) {
    return this.usersService.findByIdOrThrow(id);
  }

  @Patch(':userId')
  async updateUserInfo(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserInfo(userId, updateUserDto);
  }

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
