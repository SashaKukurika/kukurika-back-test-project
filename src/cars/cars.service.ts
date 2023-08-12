import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';

import { MailTemplateEnum } from '../core/mail/enums/mail-template.enum';
import { MailService } from '../core/mail/mail.service';
import { CurrencyService } from '../currency/currency.service';
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
    private readonly currencyService: CurrencyService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  async create(
    userId: string,
    createCarDto: CreateCarDto,
    // currency: CurrencyEnum,
  ) {
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

  async findOne() {
    return this.currencyService.getCurrencyRates();
  }

  async update(id: number, updateCarDto: CreateCarDto) {
    return `This action updates a #${updateCarDto} car`;
  }

  async addBrand(userId: string, brand: string) {
    // TODO add email from user
    await this.mailService.send(
      this.configService.get<string>('MANAGER_MAIL_TO_ADD_BRAND_MODEL'),
      brand,
      MailTemplateEnum.ADD_NEW_BRAND,
      { userId, brand },
    );
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
