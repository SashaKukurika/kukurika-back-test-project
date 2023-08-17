import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/enums/user-role.enum';
import { PaginatedDto } from '../common/pagination/response';
import { CarBrandOrModelDto } from '../common/query/car-brand-model.dto';
import { PublicUserInfoDto } from '../common/query/user.query.dto';
import { MailSubjectEnum } from '../core/mail/enums/mail-subject.enum';
import { MailTemplateEnum } from '../core/mail/enums/mail-template.enum';
import { MailService } from '../core/mail/mail.service';
import { ResponseService, UserMapper } from '../core/mappers/mapper.service';
import { ManagerCreateDto } from './dto/create-manager.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PublicUserData } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly responseService: ResponseService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({});
  }
  // TODO norm paginate
  async findAllWhitPagination(
    query: PublicUserInfoDto,
  ): Promise<PaginatedDto<PublicUserData>> {
    query.sort = query.sort || 'id';
    query.order = query.order || 'ASC';

    const options = {
      page: query.page || 1,
      limit: query.limit || 5,
    };

    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select('id, age, email, "name"');

    if (query.search) {
      queryBuilder.where('"name" IN(:...search)', {
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
  async findByIdOrThrow(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: +id } });
      if (!user) {
        throw new HttpException(
          `User with id ${id} not exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return user;
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUserInfo(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserMapper> {
    await this.findByIdOrThrow(id);
    try {
      const {
        raw: [updatedUser],
      } = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set(updateUserDto)
        .where('id = :id', { id: +id })
        .returning('*') // Повернення оновлених даних
        .execute();

      return this.responseService.createUserResponse(updatedUser);
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    try {
      await this.userRepository.delete(+id);
    } catch (e) {
      throw new HttpException(`${e}`, HttpStatus.BAD_REQUEST);
    }
  }

  async addNewBrandOrModel(id: string, query: CarBrandOrModelDto) {
    const { brand, model } = query;
    const { email } = await this.findByIdOrThrow(id);

    let subject = MailSubjectEnum.BRAND;
    if (model) {
      subject = MailSubjectEnum.MODEL;
    }

    await this.mailService.send(
      this.configService.get<string>('MANAGER_MAIL_TO_ADD_BRAND_MODEL'),
      subject,
      MailTemplateEnum.ADD_NEW_BRAND_OR_MODEL,
      { email, brand, model },
    );
  }

  async createManager(managerCreateDto: ManagerCreateDto): Promise<User> {
    const user = await this.userRepository.create({
      ...managerCreateDto,
      role: UserRole.MANAGER,
    });
    await this.userRepository.save(user);
    return user;
  }
}
