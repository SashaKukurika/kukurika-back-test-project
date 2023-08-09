import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
