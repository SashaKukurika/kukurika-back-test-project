import { ApiProperty } from '@nestjs/swagger';

export class JwtTokensInterface {
  @ApiProperty()
  token: string;
  @ApiProperty()
  refreshToken: string;
}
