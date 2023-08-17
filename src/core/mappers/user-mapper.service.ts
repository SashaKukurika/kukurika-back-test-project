import { Injectable } from '@nestjs/common';

import { User } from '../../users/entities/user.entity';

export class UserMapper {
  id: number;
  name: string;
  email: string;
  age: number;
  premiumAccount: boolean;
  role: string;
  phone: string;
}

@Injectable()
export class UserResponseService {
  create(user: User): UserMapper {
    const userResponse = new UserMapper();
    userResponse.id = user.id;
    userResponse.name = user.name;
    userResponse.email = user.email;
    userResponse.age = user.age;
    userResponse.premiumAccount = user.premiumAccount;
    userResponse.role = user.role;
    userResponse.phone = user.phone;

    return userResponse;
  }
}
