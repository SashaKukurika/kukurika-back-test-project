import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserCreateDto {
  // ApiProperty for swagger
  @ApiProperty()
  @IsString()
  // put list of valid variants
  // @IsEnum()
  name: string;

  @ApiProperty()
  // IsNumber validate value must be a number
  @IsNumber()
  @IsOptional()
  age: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
