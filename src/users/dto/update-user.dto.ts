import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  // ApiProperty for swagger
  @ApiProperty()
  @IsString()
  @IsOptional()
  // put list of valid variants
  // @IsEnum()
  name: string;

  @ApiProperty()
  // IsNumber validate value must be a number
  @IsNumber()
  @IsOptional()
  age: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  premiumAccount: boolean;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  // @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  // roles: RoleEnum[] = []
}
