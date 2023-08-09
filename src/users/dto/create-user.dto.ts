import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

// first validation before DB - must have
export class UserCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  // roles: RoleEnum[] = []
}
