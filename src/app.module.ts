import { Module } from '@nestjs/common';

import { AnimalsModule } from './animals/animals.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [UsersModule, AnimalsModule],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule {}
