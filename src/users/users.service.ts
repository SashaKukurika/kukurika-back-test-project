import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { PaginatedDto } from '../common/pagination/response';
import { PublicUserInfoDto } from '../common/query/user.query.dto';
import { PasswordService } from '../password/password.service';
import { UserCreateDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PublicUserData } from './interface/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
  ) {}
  async login(data: UserCreateDto): Promise<{ token: string }> {
    const findUser = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });
    if (!findUser) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isMatched = await this.passwordService.compare(
      data.password,
      findUser.password,
    );

    if (!isMatched) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.signIn(findUser);

    return { token };
  }
  async register(data: UserCreateDto): Promise<{ token: string }> {
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

    data.password = await this.passwordService.getHash(data.password);
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

  // async findOne(userId: string): Promise<User> {
  //   return await this.userRepository.findOne({
  //     where: {
  //       id: +userId,
  //     },
  //   });
  // }

  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto) {
    try {
      await this.findByIdOrThrow(userId);

      const { raw } = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(updateUserDto)
        .where('id = :id', { id: userId })
        .returning('*') // Повернення оновлених даних
        .execute();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = raw[0];
      return result;
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.findByIdOrThrow(userId);

      await this.userRepository.delete(userId);
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createManager(data: UserCreateDto): Promise<User> {
    const user = await this.userRepository.create({ ...data, role: 'manager' });
    await this.userRepository.save(user);
    return user;
  }

  async signIn(user) {
    return await this.authService.signIn({
      id: user.id.toString(),
      role: user.role,
    });
  }

  async findByIdOrThrow(value: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: +value } });
      if (!user) {
        throw new HttpException(
          `User with id ${value} not exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return user;
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }
}
