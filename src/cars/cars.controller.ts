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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';

import { CarsService } from './cars.service';
import { CarBrandDto } from './dto/car-brand.dto';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Model } from './entities/model.entity';
import { CarBrandEnum } from './enums/car-brand.enum';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post('/fill/database')
  async fillDataBase() {
    return await this.carsService.fillDataBaseBrandsAndModels();
  }

  @Post(':userId/create')
  async create(
    @Param('userId') userId: string,
    @Body() createCarDto: CreateCarDto,
  ) {
    return this.carsService.create(userId, createCarDto);
  }

  @Get('/brands')
  async findAllBrands() {
    return await this.carsService.findAllBrands();
  }
  @Get('/models')
  async findAllModelsOfTheBrand(@Query() data: CarBrandDto): Promise<Model[]> {
    return await this.carsService.findAllModelsOfTheBrand(data);
  }

  @Get(':brand/model')
  async findAllUniqueModelByBrand(@Param('brand') brand: CarBrandEnum) {
    return await this.carsService.findAllUniqueModelByBrand(brand);
  }

  @Patch(':carId')
  update(@Param('carId') carId: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(carId, updateCarDto);
  }

  @Get(':carId/ad')
  getCarById(@Param('carId') carId: string) {
    return this.carsService.getCarById(carId);
  }

  @Get(':carId/ad/statistics')
  getCarStatistics(@Param('carId') carId: string) {
    return this.carsService.getCarStatistics(carId);
  }

  @Delete(':carId/photo')
  async removePhoto(@Param('carId') id: string): Promise<void> {
    return await this.carsService.removePhoto(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':carId/upload-file')
  async addPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('carId') id: string,
  ) {
    return await this.carsService.addPhoto(file, id);
  }
}
