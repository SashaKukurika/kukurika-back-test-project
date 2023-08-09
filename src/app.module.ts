import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { TypeOrmConfiguration } from './config/database/type-orm-configuration';
import { PasswordModule } from './password/password.module';
import { PasswordService } from './password/password.service';
import { PaymentModule } from './payment/payment.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeOrmConfiguration.config),
    UsersModule,
    AuthModule,
    PasswordModule,
    PaymentModule,
    CarsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
