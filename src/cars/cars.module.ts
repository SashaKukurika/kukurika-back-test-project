import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { User } from '../users/entities/user.entity';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { Brand } from './entities/brand.entity';
import { Car } from './entities/car.entity';
import { Counter } from './entities/counter.entity';
import { Model } from './entities/model.entity';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
  imports: [
    TypeOrmModule.forFeature([Car, User, Brand, Model, Counter]),
    AuthModule,
    CoreModule,
  ],
})
export class CarsModule {}
