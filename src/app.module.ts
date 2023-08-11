import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { TypeOrmConfiguration } from './config/database/type-orm-configuration';
import { CurrencyModule } from './currency/currency.module';
import { PasswordModule } from './password/password.module';
import { PasswordService } from './password/password.service';
import { PaymentModule } from './payment/payment.module';
import { S3Module } from './s3/s3.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(TypeOrmConfiguration.config),
    UsersModule,
    AuthModule,
    PasswordModule,
    PaymentModule,
    CarsModule,
    S3Module,
    CurrencyModule,
  ],
  controllers: [AppController],
  providers: [AppService, PasswordService],
})
export class AppModule {}
