import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private salt = 5;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  async createUser(data: UserCreateDto) {
    const findUser = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });
    if (findUser) {
      throw new HttpException(
        'User with this email already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    data.password = await this.getHash(data.password);
    const newUser = this.userRepository.create(data);

    await this.userRepository.save(newUser);

    const token = await this.signIn(newUser);

    return { token };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(userId: number) {
    return `This action returns a #${userId} user`;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${userId} user`;
  }

  async remove(userId: number) {
    return `This action removes a #${userId} user`;
  }

  async getHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.salt);
  }

  async signIn(user) {
    return await this.authService.signIn({
      id: user.id.toString(),
      role: user.role,
    });
  }
}
