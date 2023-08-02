import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// first validation before DB - must have
export class UserCreateDto {
  // ApiProperty for swagger
  @ApiProperty()
  @IsString()
  // put list of valid variants
  // @IsEnum()
  userName: string;

  @ApiProperty()
  // IsNumber validate value must be a number
  @IsNumber()
  @IsOptional()
  age: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
