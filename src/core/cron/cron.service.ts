import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

import { Car } from '../../cars/entities/car.entity';
import { Counter } from '../../cars/entities/counter.entity';
import { CurrencyEnum } from '../../cars/enums/currency.enum';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Counter)
    private readonly counterRepository: Repository<Counter>,
    private readonly currencyService: CurrencyService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async currencyUpdate(): Promise<void> {
    const currencyArr = await this.currencyService.getCurrencyRates();

    await Promise.all([
      this.carRepository
        .createQueryBuilder()
        .update(Car)
        .set({
          currencyRate: currencyArr[0].buy,
          price: () => `userPrice * ${currencyArr[0].buy}`,
        })
        .where('userCurrency = :userCurrency', {
          userCurrency: CurrencyEnum.Eur,
        })
        .execute(),
      this.carRepository
        .createQueryBuilder()
        .update(Car)
        .set({
          currencyRate: currencyArr[1].buy,
          price: () => `userPrice * ${currencyArr[1].buy}`,
        })
        .where('userCurrency = :userCurrency', {
          userCurrency: CurrencyEnum.Usd,
        })
        .execute(),
    ]);
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async counterUpdate(): Promise<void> {
    const currentDate = moment(new Date());

    const counters = await this.counterRepository.find();
    counters.forEach((counter) => {
      const sevenDaysFromNow = moment(counter.createdAt)
        .add(7, 'days')
        .format('YYYY-MM-DD');

      const oneMonthFromNow = moment(counter.createdAt)
        .add(1, 'month')
        .format('YYYY-MM-DD');

      if (currentDate.isAfter(sevenDaysFromNow)) {
        this.counterRepository.update(
          { id: counter.id },
          { viewsPerWeek: counter.viewsPerWeek - counter.viewsPerDay },
        );
      }
      if (currentDate.isAfter(oneMonthFromNow)) {
        this.counterRepository.update(
          { id: counter.id },
          { viewsPerMonth: counter.viewsPerMonth - counter.viewsPerDay },
        );
      }
      this.counterRepository.update({ id: counter.id }, { viewsPerDay: 0 });
    });
  }
}
