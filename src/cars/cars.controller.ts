import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';

import { Role } from '../auth/decorators/role';
import { UserRole } from '../auth/enums/user-role.enum';
import { AccessTokenGuard } from '../auth/guard/access-token.guard';
import { RoleGuard } from '../auth/guard/authorization.guard';
import { PaginatedDto } from '../common/pagination/response';
import { PublicCarInfoDto } from '../common/query/car.query.dto';
import { StaticMapper } from '../core/mappers/mapper.service';
import { CarsService } from './cars.service';
import { CarBrandDto } from './dto/car-brand.dto';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Brand } from './entities/brand.entity';
import { Car } from './entities/car.entity';
import { Model } from './entities/model.entity';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post('/fill/database')
  async fillDataBase(): Promise<void> {
    return await this.carsService.fillDataBaseBrandsAndModels();
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post(':userId/create')
  async create(
    @Param('userId') userId: string,
    @Body() createCarDto: CreateCarDto,
  ): Promise<void> {
    return this.carsService.create(userId, createCarDto);
  }

  @Get('/brands')
  async findAllBrands(): Promise<Brand[]> {
    return await this.carsService.findAllBrands();
  }
  @Get('/models')
  async findAllModelsOfTheBrand(
    @Query() carBrandDto: CarBrandDto,
  ): Promise<Model[]> {
    return await this.carsService.findAllModelsOfTheBrand(carBrandDto);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Patch(':id/update')
  update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.carsService.update(id, updateCarDto, userId);
  }

  @Get()
  async findAllCarsWithPagination(
    @Query() query: PublicCarInfoDto,
  ): Promise<PaginatedDto<Car>> {
    return await this.carsService.findAllCarsWithPagination(query);
  }

  @Get(':id/ad')
  getCarById(@Param('id') id: string): Promise<Car> {
    return this.carsService.getCarById(id);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get(':id/ad/statistics')
  getCarStatistics(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<StaticMapper> {
    return this.carsService.getCarStatistics(id, userId);
  }

  @Role(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id/photo')
  async removePhoto(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return await this.carsService.removePhoto(id, userId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/upload-file')
  async addPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.carsService.addPhoto(file, id);
  }
}
