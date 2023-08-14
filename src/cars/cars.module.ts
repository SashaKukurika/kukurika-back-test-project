import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { CurrencyModule } from '../currency/currency.module';
import { S3Module } from '../s3/s3.module';
import { User } from '../users/entities/user.entity';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { Car } from './entities/car.entity';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
  imports: [
    TypeOrmModule.forFeature([Car, User]),
    AuthModule,
    S3Module,
    CurrencyModule,
    CoreModule,
  ],
})
export class CarsModule {}
