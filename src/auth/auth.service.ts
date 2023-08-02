import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { JWTPayload } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,
  ) {}

  async signIn(data: JWTPayload): Promise<string> {
    // sign return jwt token
    return this.jwtService.sign(data);
  }

  async validateUser(data: JWTPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: Number(data.id),
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      return await this.jwtService.verify(token);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(new Date().toISOString(), token);
      throw new UnauthorizedException();
    }
  }
}
