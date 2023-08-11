import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';

import { ItemTypeEnum } from '../s3/enums/item-type.enum';
import { S3Service } from '../s3/s3.service';
import { CreateCarDto } from './dto/create-car.dto';
import { Car } from './entities/car.entity';
import { CarBrandEnum } from './enums/car-brand.enum';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly s3Service: S3Service,
  ) {}
  async create(userId: string, createCarDto: CreateCarDto) {
    createCarDto.userId = +userId;
  }

  async findAllUniqueBrands() {
    return await this.carRepository
      .createQueryBuilder('car')
      .select('DISTINCT car.brand', 'brand')
      .getRawMany();
  }

  async findAllUniqueModelByBrand(brand: CarBrandEnum) {
    return await this.carRepository
      .createQueryBuilder('car')
      .select('DISTINCT car.model', 'model')
      .where('car.brand = :brand', { brand })
      .getRawMany();
  }

  async findOne(id: number) {
    return `This action returns a #${id} car`;
  }

  async update(id: number, updateCarDto: CreateCarDto) {
    return `This action updates a #${updateCarDto} car`;
  }

  async remove(id: string) {
    //TODO add delete from DB
    const { pathToPhoto } = await this.carRepository.findOne({
      where: { id: +id },
    });
    return await this.s3Service.deleteFile(pathToPhoto);
  }

  async addPhoto(file: Express.Multer.File, id: string) {
    const pathToPhoto = await this.s3Service.uploadFile(
      file,
      ItemTypeEnum.Car,
      id,
    );
    return this.carRepository.update(id, { pathToPhoto });
  }
}
