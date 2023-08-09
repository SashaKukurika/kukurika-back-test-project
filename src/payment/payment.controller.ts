import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaymentDataDto } from './dto/payment-data.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // TODO add auth guard
  @Post(':userId')
  async createPayment(
    @Param('userId') userId: string,
    @Body() paymentData: PaymentDataDto,
  ): Promise<{ success: boolean }> {
    const paymentStatus = await this.paymentService.createPayment(
      paymentData,
      userId,
    );

    return { success: paymentStatus };
  }
}
