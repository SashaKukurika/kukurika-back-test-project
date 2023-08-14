import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';

import { CurrencyService } from '../currency/currency.service';
import { ItemTypeEnum } from '../s3/enums/item-type.enum';
import { S3Service } from '../s3/s3.service';
import { User } from '../users/entities/user.entity';
import { CarBrandDto } from './dto/car-brand.dto';
import { CreateCarDto } from './dto/create-car.dto';
import { Brand } from './entities/brand.entity';
import { Car } from './entities/car.entity';
import { Model } from './entities/model.entity';
import { CarBrandEnum } from './enums/car-brand.enum';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    private readonly s3Service: S3Service,
    private readonly currencyService: CurrencyService,
  ) {}

  async fillDataBaseBrandsAndModels() {
    const brandsArr = [
      'Toyota',
      'Audi',
      'Ford',
      'Mercedes-Benz',
      'Honda',
      'Nissan',
      'Chevrolet',
      'Kia',
      'Hyundai',
      'Volkswagen',
    ];
    const modelsArr = [
      ['Corolla', 'Camry', 'RAV4', 'Prius', 'Highlander'],
      ['A3', 'A4', 'Q5', 'Q7', 'A6'],
      ['Mustang', 'Focus', 'Escape', 'Explorer', 'F-150'],
      ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
      ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit'],
      ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'Sentra'],
      ['Cruze', 'Malibu', 'Equinox', 'Traverse', 'Silverado'],
      ['Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride'],
      ['Elantra', 'Tucson', 'Santa Fe', 'Sonata', 'Kona'],
      ['Jetta', 'Passat', 'Tiguan', 'Golf', 'Atlas'],
    ];

    for (let i = 0; i < brandsArr.length; i++) {
      const brand = this.brandRepository.create({ name: brandsArr[i] });
      const savedBrand = await this.brandRepository.save(brand);

      const modelNames = modelsArr[i];
      const models = modelNames.map((modelName) => {
        return this.modelRepository.create({
          name: modelName,
          brand: savedBrand,
        });
      });
      await this.modelRepository.save(models);
      savedBrand.models = models;
    }
  }

  async create(
    userId: string,
    createCarDto: CreateCarDto,
    // currency: CurrencyEnum,
  ) {
    createCarDto.userId = +userId;
  }

  async findAllBrands() {
    try {
      return await this.brandRepository.find({ select: ['name'] });
    } catch (e) {
      throw new HttpException(`Cant find brands ${e}`, 404);
    }
  }

  async findAllModelsOfTheBrand(data: CarBrandDto): Promise<Model[]> {
    const brandId = await this.brandRepository.findOne({
      select: ['id'],
      where: { name: data.brand },
    });
    return await this.modelRepository.find({
      select: ['name'],
      where: { brand: brandId },
    });
  }

  async findAllUniqueModelByBrand(brand: CarBrandEnum) {
    return await this.carRepository
      .createQueryBuilder('car')
      .select('DISTINCT car.model', 'model')
      .where('car.brand = :brand', { brand })
      .getRawMany();
  }

  async findOne() {
    return this.currencyService.getCurrencyRates();
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

  // async createPrice(price: number, currency: CurrencyEnum)
}
