import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnimalsController } from './animals/animals.controller';
import { AnimalsModule } from './animals/animals.module';
import { AnimalsService } from './animals/animals.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmConfiguration } from './config/database/type-orm-configuration';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(TypeOrmConfiguration.config),
    UsersModule,
    AnimalsModule,
    AuthModule,
  ],
  controllers: [AppController, AnimalsController],
  providers: [AppService, AnimalsService],
})
export class AppModule {}
