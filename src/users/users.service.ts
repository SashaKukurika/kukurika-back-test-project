import { Injectable } from '@nestjs/common';

import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor() {}
  create(userCreateDto: UserCreateDto) {
    return userCreateDto;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(userId: number) {
    return `This action returns a #${userId} user`;
  }

  update(userId: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${userId} user`;
  }

  remove(userId: number) {
    return `This action removes a #${userId} user`;
  }
}
