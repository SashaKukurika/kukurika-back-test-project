import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { PaginatedDto } from '../common/pagination/response';
import { PublicUserInfoDto } from '../common/query/user.query.dto';
import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PublicUserData } from './interface/user.interface';

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

  async findAll(
    query: PublicUserInfoDto,
  ): Promise<PaginatedDto<PublicUserData>> {
    query.sort = query.sort || 'id';
    query.order = query.order || 'ASC';

    const options = {
      page: query.page || 1,
      limit: query.limit || 2,
    };

    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select('id, age, email, "userName"');

    if (query.search) {
      queryBuilder.where('"userName" IN(:...search)', {
        search: query.search.split(','),
      });
    }

    queryBuilder.orderBy(`${query.sort}`, query.order as 'ASC' | 'DESC');

    const [pagination, rawResults] = await paginateRawAndEntities(
      queryBuilder,
      options,
    );

    return {
      page: pagination.meta.currentPage,
      pages: pagination.meta.totalPages,
      countItem: pagination.meta.totalItems,
      entities: rawResults as any as [PublicUserData],
    };
  }

  async findOne(userId: number) {
    return `This action returns a #${userId} user`;
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
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
