import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';

import { CurrencyService } from '../core/currency/currency.service';
import { ItemTypeEnum } from '../s3/enums/item-type.enum';
import { S3Service } from '../s3/s3.service';
import { User } from '../users/entities/user.entity';
import { CarBrandDto } from './dto/car-brand.dto';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Brand } from './entities/brand.entity';
import { Car } from './entities/car.entity';
import { Model } from './entities/model.entity';
import { CarBrandEnum } from './enums/car-brand.enum';
import { CurrencyEnum } from './enums/currency.enum';
import BadWordsFilter = require('bad-words');
import { ConfigService } from '@nestjs/config';

import { MailTemplateEnum } from '../core/mail/enums/mail-template.enum';
import { MailService } from '../core/mail/mail.service';
import { Counter } from './entities/counter.entity';

@Injectable()
export class CarsService {
  private readonly filter = new BadWordsFilter();
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    @InjectRepository(Counter)
    private readonly counterRepository: Repository<Counter>,
    private readonly s3Service: S3Service,
    private readonly currencyService: CurrencyService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async findAllBrands() {
    try {
      return await this.brandRepository.find({ select: ['name'] });
    } catch (e) {
      throw new HttpException(`Cant find brands ${e}`, 404);
    }
  }

  async create(userId: string, createCarDto: CreateCarDto) {
    const user = await this.userRepository.findOne({
      where: { id: +userId },
      relations: ['cars'],
    });

    if (!user) {
      throw new HttpException(
        `User with id ${userId} not exist`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.cars.length > 0 && !user.premiumAccount) {
      throw new HttpException(
        'Only one ad can be placed. For more, buy a premium account.',
        HttpStatus.FORBIDDEN,
      );
    }

    const { price, currencyBuyRate } = await this.createPrice(
      createCarDto.userPrice,
      createCarDto.userCurrency as CurrencyEnum,
    );

    createCarDto.price = price;
    createCarDto.currencyRate = currencyBuyRate;

    const newCar = await this.carRepository.create({
      ...createCarDto,
      user: user,
    });

    await this.carRepository.save(newCar);

    if (this.filter.isProfane(createCarDto.advertisementText)) {
      throw new HttpException(
        'Profanity is prohibited. You can edit your ad.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.carRepository.update({ id: newCar.id }, { isActive: true });

    const newCounter = await this.counterRepository.create({
      car: newCar,
    });
    await this.counterRepository.save(newCounter);
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

  async update(carId: string, updateCarDto: UpdateCarDto) {
    const car = await this.findByIdOrThrow(carId);
    if (car.profanityCount === 2) {
      const {
        user: { email },
      } = await this.carRepository
        .createQueryBuilder('car')
        .leftJoinAndSelect('car.user', 'user')
        .where('car.id = :carId', { carId })
        .getOne();

      await this.mailService.send(
        this.configService.get<string>('MANAGER_MAIL_TO_MODERATE'),
        'Moderate',
        MailTemplateEnum.MODERATE_AD,
        {
          ...updateCarDto,
          apiUrl: this.configService.get<string>('AWS_S3_URL'),
          id: carId,
          userCurrency: car.userCurrency,
          currencyRate: car.currencyRate,
          price: car.price,
          email,
        },
      );
    }
    if (car.profanityCount > 2) {
      throw new HttpException(
        'You can no longer edit the ad, we have sent a letter with the ad to the manager for moderation',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (this.filter.isProfane(updateCarDto.advertisementText)) {
      await this.carRepository.increment({ id: +carId }, 'profanityCount', 1);
      throw new HttpException(
        `The ad has not passed moderation, there are ${
          2 - car.profanityCount
        } attempts left.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.carRepository.update(
      { id: +carId },
      { ...updateCarDto, isActive: true },
    );
  }

  async removePhoto(id: string): Promise<void> {
    //TODO add delete from DB
    const { pathToPhoto } = await this.carRepository.findOne({
      where: { id: +id },
    });
    await this.s3Service.deleteFile(pathToPhoto);
  }

  async addPhoto(file: Express.Multer.File, id: string) {
    const pathToPhoto = await this.s3Service.uploadFile(
      file,
      ItemTypeEnum.Car,
      id,
    );
    return this.carRepository.update(id, { pathToPhoto });
  }

  async getCarById(carId: string) {
    const car = await this.findByIdOrThrow(carId);
    if (!car.isActive) {
      throw new HttpException('This ad is not active.', HttpStatus.BAD_REQUEST);
    }
    await this.counterRepository
      .createQueryBuilder()
      .update(Counter)
      .set({
        views: () => 'views + 1',
        viewsPerDay: () => 'viewsPerDay + 1',
        viewsPerWeek: () => 'viewsPerWeek + 1',
        viewsPerMonth: () => 'viewsPerMonth + 1',
      })
      .where('car.id = :carId', { carId })
      .execute();

    const carWithUser = await this.carRepository.findOne({
      where: { id: +carId },
      relations: ['user'],
    });
    const {
      user: { email, phone },
    } = carWithUser;

    return { car, email, phone };
  }

  async getCarStatistics(carId: string) {
    const user = await this.userRepository.findOne({
      where: { cars: { id: +carId } },
    });

    if (!user.premiumAccount) {
      throw new HttpException(
        'Only users with Premium account can get statistics. For more, buy a premium account.',
        HttpStatus.FORBIDDEN,
      );
    }

    const { region } = await this.carRepository.findOne({
      where: { id: +carId },
    });

    const { averagePriceByRegion } = await this.carRepository
      .createQueryBuilder('car')
      .select('AVG(car.price)', 'averagePriceByRegion')
      .where('car.region = :region', { region })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .getRawOne();

    const { averagePrice } = await this.carRepository
      .createQueryBuilder('car')
      .select('AVG(car.price)', 'averagePrice')
      .where('car.isActive = :isActive', { isActive: true })
      .getRawOne();

    const counter = await this.counterRepository.findOne({
      where: { car: { id: +carId } },
    });
    const ukraineAveragePrice = parseInt(averagePrice);
    return { averagePriceByRegion, ukraineAveragePrice, counter };
  }

  async createPrice(
    userPrice: number,
    userCurrency: CurrencyEnum,
  ): Promise<any> {
    const currencyRates = await this.currencyService.getCurrencyRates();
    let price = userPrice;
    let currencyBuyRate = 1;

    switch (userCurrency) {
      case CurrencyEnum.Eur:
        price = currencyRates[0].buy * userPrice;
        currencyBuyRate = currencyRates[0].buy;
        break;
      case CurrencyEnum.Usd:
        price = currencyRates[1].buy * userPrice;
        currencyBuyRate = currencyRates[1].buy;
        break;
    }

    return { price, currencyBuyRate };
  }

  async findByIdOrThrow(id: string): Promise<Car> {
    try {
      const car = await this.carRepository.findOne({ where: { id: +id } });
      if (!car) {
        throw new HttpException(
          `Car with id ${id} not exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return car;
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

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
}
