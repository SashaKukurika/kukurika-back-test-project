import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { PasswordModule } from '../password/password.module';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { Car } from './entities/car.entity';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
  imports: [TypeOrmModule.forFeature([Car]), AuthModule, PasswordModule],
})
export class CarsModule {}
