import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  year: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
