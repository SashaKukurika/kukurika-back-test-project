import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnimalsController } from './animals/animals.controller';
import { AnimalsModule } from './animals/animals.module';
import { AnimalsService } from './animals/animals.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfiguration } from './config/database/type-orm-configuration';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeOrmConfiguration.config),
    UsersModule,
    AnimalsModule,
  ],
  controllers: [AppController, UsersController, AnimalsController],
  providers: [AppService, UsersService, AnimalsService],
})
export class AppModule {}
