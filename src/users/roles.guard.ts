import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRepository: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();

    if (request?.user) {
      const user = await this.userRepository.findOne({
        where: {
          id: request.user.id,
        },
      });
      return roles.includes(user.role);
    }

    return false;
  }
}
