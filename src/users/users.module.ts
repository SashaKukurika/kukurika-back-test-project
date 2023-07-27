import { Module } from '@nestjs/common';

import { AnimalsModule } from '../animals/animals.module';
import { AnimalsService } from '../animals/animals.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  // imports some "AnimalsService" service to use his in this module
  providers: [UsersService, AnimalsService],
  // imports some module to use his in this module
  imports: [AnimalsModule],
})
export class UsersModule {}
