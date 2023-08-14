import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CarBrandOrModelDto {
  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model: string;
}
