import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { UpdateCarDto } from './update-car.dto';

// first validation before DB - must have
export class CreateCarDto extends UpdateCarDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currencyRate: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  profanityCount: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
