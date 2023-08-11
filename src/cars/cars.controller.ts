import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';

import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { CarBrandEnum } from './enums/car-brand.enum';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post(':userId')
  async create(@Param() userId: string, @Body() createCarDto: CreateCarDto) {
    return this.carsService.create(userId, createCarDto);
  }

  @Get('/brand')
  async findAllUniqueBrands() {
    return await this.carsService.findAllUniqueBrands();
  }

  @Get(':brand/model')
  async findAllUniqueModelByBrand(@Param('brand') brand: CarBrandEnum) {
    return await this.carsService.findAllUniqueModelByBrand(brand);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.carsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
  //   return this.carsService.update(+id, updateCarDto);
  // }

  @Delete(':carId/photo')
  async remove(@Param('carId') id: string) {
    return this.carsService.remove(id);
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
