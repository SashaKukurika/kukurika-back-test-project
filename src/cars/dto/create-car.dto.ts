import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

// first validation before DB - must have
export class CreateCarDto {
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
  price: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pathToPhoto: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsNotEmpty()
  isActive: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
