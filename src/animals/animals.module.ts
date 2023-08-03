import { Module } from '@nestjs/common';

import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

@Module({
  controllers: [AnimalsController],
  providers: [AnimalsService],
  // exports this module, to have possibility to use it at another module
  exports: [],
})
export class AnimalsModule {}
