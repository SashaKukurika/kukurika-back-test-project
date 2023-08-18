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
import { UserMapper } from '../core/mappers/mapper.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ManagerCreateDto } from './dto/create-manager.dto';
import { PaymentDataDto } from './dto/payment-data.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PublicUserData } from './interfaces/user.interface';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiExtraModels(PublicUserData, PaginatedDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiPaginatedResponse('entities', PublicUserData)
  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get('/pagination')
  async findAllWhitPagination(
    @Query() query: PublicUserInfoDto,
  ): Promise<PaginatedDto<PublicUserData>> {
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

  @Role(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Patch(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(id);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post(':id/brandOrModel')
  async addNewBrandOrModel(
    @Param('id') id: string,
    @Query() query: CarBrandOrModelDto,
  ) {
    return await this.usersService.addNewBrandOrModel(id, query);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post(':userId/payment')
  async createPayment(
    @Param('userId') userId: string,
    @Body() paymentData: PaymentDataDto,
  ): Promise<{ success: boolean }> {
    const paymentStatus = await this.usersService.createPayment(
      paymentData,
      userId,
    );

    return { success: paymentStatus };
  }

  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post('/manager/create')
  async createManager(@Body() managerCreateDto: ManagerCreateDto) {
    return this.usersService.createManager(managerCreateDto);
  }
}
