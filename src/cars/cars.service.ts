import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Express } from 'express';
import { Repository } from 'typeorm';

import { PublicCarInfoDto } from '../common/query/car.query.dto';
import { CurrencyService } from '../core/currency/currency.service';
import { MailTemplateEnum } from '../core/mail/enums/mail-template.enum';
import { MailService } from '../core/mail/mail.service';
import { ResponseService, StaticMapper } from '../core/mappers/mapper.service';
import { User } from '../users/entities/user.entity';
import { CarBrandDto } from './dto/car-brand.dto';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Brand } from './entities/brand.entity';
import { Car } from './entities/car.entity';
import { Counter } from './entities/counter.entity';
import { Model } from './entities/model.entity';
import { CurrencyEnum } from './enums/currency.enum';
import BadWordsFilter = require('bad-words');
import { PaginatedDto } from '../common/pagination/response';
import { ItemTypeEnum } from '../core/s3/enums/item-type.enum';
import { S3Service } from '../core/s3/s3.service';

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
    private readonly responseService: ResponseService,
  ) {}

  async findAllBrands(): Promise<Brand[]> {
    try {
      return await this.brandRepository.find({ select: ['name'] });
    } catch (e) {
      throw new HttpException(`Cant find brands ${e}`, 404);
    }
  }

  async create(userId: string, createCarDto: CreateCarDto): Promise<void> {
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

  async findAllModelsOfTheBrand(carBrandDto: CarBrandDto): Promise<Model[]> {
    const brandId = await this.brandRepository.findOne({
      select: ['id'],
      where: { name: carBrandDto.brand },
    });
    return await this.modelRepository.find({
      select: ['name'],
      where: { brand: brandId },
    });
  }

  async update(
    id: string,
    updateCarDto: UpdateCarDto,
    userId: string,
  ): Promise<void> {
    const car = await this.findByIdOrThrow(id);
    await this.checkCarOwnerOrThrow(id, userId);

    if (car.profanityCount === 2) {
      const {
        user: { email },
      } = await this.carRepository
        .createQueryBuilder('car')
        .leftJoinAndSelect('car.user', 'user')
        .where('car.id = :id', { id })
        .getOne();

      await this.mailService.send(
        this.configService.get<string>('MANAGER_MAIL_TO_MODERATE'),
        'Moderate',
        MailTemplateEnum.MODERATE_AD,
        {
          ...updateCarDto,
          apiUrl: this.configService.get<string>('AWS_S3_URL'),
          id: id,
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
      await this.carRepository.increment({ id: +id }, 'profanityCount', 1);
      throw new HttpException(
        `The ad has not passed moderation, there are ${
          2 - car.profanityCount
        } attempts left.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.carRepository.update(
      { id: +id },
      { ...updateCarDto, isActive: true },
    );
  }

  async removePhoto(id: string, userId: string): Promise<void> {
    await this.checkCarOwnerOrThrow(id, userId);

    const { pathToPhoto } = await this.carRepository.findOne({
      where: { id: +id },
    });
    await Promise.all([
      this.s3Service.deleteFile(pathToPhoto),
      this.carRepository
        .createQueryBuilder()
        .update(Car)
        .set({ pathToPhoto: null })
        .where('id = :id', { id })
        .execute(),
    ]);
  }

  async addPhoto(file: Express.Multer.File, id: string): Promise<void> {
    const pathToPhoto = await this.s3Service.uploadFile(
      file,
      ItemTypeEnum.Car,
      id,
    );
    await this.carRepository.update(id, { pathToPhoto });
  }

  async findAllCarsWithPagination(
    query: PublicCarInfoDto,
  ): Promise<PaginatedDto<Car>> {
    query.order = query.order || 'ASC';

    const page = +query.page || 1;
    const limit = +query.limit || 5;
    const offset = (page - 1) * limit;

    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.user', 'user');

    switch (query.sort) {
      case 'year':
        queryBuilder.orderBy('car.year', query.order);
        break;
      case 'price':
        queryBuilder.orderBy('car.price', query.order);
        break;
      case 'region':
        queryBuilder.orderBy('car.region', query.order);
        break;
      default:
        queryBuilder.orderBy('car.id', query.order);
    }

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);
    const [entities, count] = await queryBuilder.getManyAndCount();
    const map = entities.map((car) =>
      this.responseService.createCarResponse(car),
    );
    return {
      page,
      pages: Math.ceil(count / limit),
      countItem: count,
      entities: map,
    };
  }

  async getCarById(id: string): Promise<Car> {
    const car = await this.findByIdOrThrow(id);
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
      .where('car.id = :id', { id })
      .execute();

    const carWithUser = await this.carRepository.findOne({
      where: { id: +id },
      relations: ['user'],
    });

    return this.responseService.createCarResponse(carWithUser);
  }

  async getCarStatistics(carId: string, userId: string): Promise<StaticMapper> {
    const user = await this.userRepository.findOne({
      where: { cars: { id: +carId } },
    });
    await this.checkCarOwnerOrThrow(carId, userId);

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

    return this.responseService.createStatisticResponse(
      averagePriceByRegion,
      averagePrice,
      counter,
    );
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

  async checkCarOwnerOrThrow(carId: string, userId: string) {
    const carsByUserId = await this.carRepository.find({
      where: { user: { id: +userId } },
    });

    const includes = carsByUserId
      .map((car) => car.id === +carId)
      .includes(true);
    if (!includes) {
      throw new HttpException('It is not your car', HttpStatus.BAD_REQUEST);
    }
  }

  async fillDataBaseBrandsAndModels(): Promise<void> {
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
