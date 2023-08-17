import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto, RegisterDto } from './dto/register.dto';
import { JwtTokensInterface } from './interface/jwt-tokens.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: [RegisterDto] })
  @Post('/register')
  async register(@Body() registerDto: RegisterDto): Promise<void> {
    return await this.authService.createUser(registerDto);
  }

  @ApiBody({ type: [LoginDto] })
  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<JwtTokensInterface> {
    return await this.authService.login(loginDto);
  }

  @ApiBody({ type: [RefreshTokenDto] })
  @Post('/refresh-token')
  async refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
  ): Promise<JwtTokensInterface> {
    return await this.authService.refreshTokens(refreshToken);
  }
}
