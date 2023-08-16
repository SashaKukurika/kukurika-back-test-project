import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from '../password/password.service';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/register.dto';
import { UserRole } from './enums/user-role.enum';
import { JwtTokensInterface } from './interface/jwt-tokens.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(registerDto: RegisterDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (user) {
      throw new HttpException(
        'User with this email already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    registerDto.password = await this.passwordService.getHash(
      registerDto.password,
    );

    await this.userRepository.save({
      ...registerDto,
      role: UserRole.USER,
    });
  }

  async login(loginDto: LoginDto): Promise<JwtTokensInterface> {
    const { password, email } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatched = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isMatched) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.getTokens(user);
  }

  async refreshTokens(token: string): Promise<JwtTokensInterface> {
    try {
      const { sub: email } = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });

      return this.getTokens(user);
    } catch (e) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
  private async getTokens(user: User): Promise<JwtTokensInterface> {
    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION',
          ),
        },
      ),
    ]);

    return { token, refreshToken };
  }
}
