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
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  age: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  premiumAccount: boolean;

  @ApiProperty({ example: '+380632922314' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
