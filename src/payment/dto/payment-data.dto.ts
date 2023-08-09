import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// first validation before DB - must have
export class PaymentDataDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // TODO enum валюти
  currency: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
