import { ApiProperty } from '@nestjs/swagger';

export class PublicUserData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  email: number;

  @ApiProperty()
  premiumAccount: boolean;
}
