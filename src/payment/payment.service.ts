import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as process from 'process';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { PaymentDataDto } from './dto/payment-data.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  private readonly stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  async createPayment(
    paymentData: PaymentDataDto,
    userId: string,
  ): Promise<boolean> {
    const { amount, currency, token } = paymentData;
    try {
      const response = await axios.post(
        'https://api.stripe.com/v1/charges',
        null,
        {
          headers: {
            Authorization: `Bearer ${this.stripeSecretKey}`,
          },
          params: {
            amount,
            currency,
            source: token,
          },
        },
      );

      // TODO add userService and check by id
      if (response.data.status === 'succeeded') {
        await this.userRepository.update(userId, { premiumAccount: true });
        return true;
      }
      return false;
    } catch (error) {
      throw new HttpException(
        'Error with payment:',
        error.response.data.error.message,
      );
    }
  }
}
