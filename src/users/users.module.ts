import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnimalsModule } from '../animals/animals.module';
import { AnimalsService } from '../animals/animals.service';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  // imports some "AnimalsService" service to use his in this module
  providers: [UsersService, AnimalsService],
  // imports some module to use his in this module
  imports: [
    AnimalsModule,
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersModule],
})
export class UsersModule {}
