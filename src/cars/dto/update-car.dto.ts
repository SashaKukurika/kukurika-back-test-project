import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { CurrencyEnum } from '../enums/currency.enum';
import { RegionEnum } from '../enums/region.enum';

export class UpdateCarDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1960)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userPrice: number;

  @ApiProperty()
  @IsString()
  @IsEnum(CurrencyEnum)
  userCurrency: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  advertisementText: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  pathToPhoto: string;

  @ApiProperty()
  @IsEnum(RegionEnum)
  @IsNotEmpty()
  region: string;
}
