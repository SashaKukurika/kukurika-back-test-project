import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInAuthDto {
  // ApiProperty for swagger
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // put list of valid variants
  // @IsEnum()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
