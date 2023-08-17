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
import { UserMapper } from '../core/mappers/user-mapper.service';
import { ManagerCreateDto } from './dto/create-manager.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
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

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  // TODO norm pagination
  @ApiPaginatedResponse('entities', PublicUserData)
  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get('/pagination')
  async findAllWhitPagination(@Query() query: PublicUserInfoDto) {
    return this.usersService.findAllWhitPagination(query);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findByIdOrThrow(id);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Patch(':id')
  async updateUserInfo(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserMapper> {
    return this.usersService.updateUserInfo(id, updateUserDto);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post('/manager')
  async createManager(@Body() data: ManagerCreateDto) {
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
