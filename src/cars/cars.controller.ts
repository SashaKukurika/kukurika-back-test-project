import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { Model } from './entities/model.entity';
import { CarBrandEnum } from './enums/car-brand.enum';
import { CurrencyEnum } from './enums/currency.enum';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  //TODO do like query currency
  @Post(':userId/currency')
  async create(
    @Param() userId: string,
    @Param() currency: CurrencyEnum,
    @Body() createCarDto: CreateCarDto,
  ) {
    return this.carsService.create(userId, createCarDto);
  }

  @Post('/fill/database')
  async fillDataBase() {
    return await this.carsService.fillDataBaseBrandsAndModels();
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

  //TODO do like query
  // @Get(':currency/:price/:carId')
  // async findOne() {
  //   return this.carsService.findOne();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
  //   return this.carsService.update(+id, updateCarDto);
  // }

  @Delete(':carId/photo')
  async remove(@Param('carId') id: string) {
    return await this.carsService.remove(id);
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
