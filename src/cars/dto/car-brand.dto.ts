import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { CarBrandEnum } from '../enums/car-brand.enum';

export class CarBrandDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(CarBrandEnum)
  brand: string;
}
