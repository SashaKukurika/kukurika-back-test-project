import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
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
  @Matches(/^\S*(?=\S{8,})(?=\S*[A-Z])(?=\S*[\d])\S*$/, {
    message: 'Password must contain 8 item, 1 uppercase letter',
  })
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
