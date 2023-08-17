import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Car } from '../../cars/entities/car.entity';
import { Counter } from '../../cars/entities/counter.entity';
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
export class CarMapper {
  pathToPhoto: string;
  user: UserMapper;
}

export class StaticMapper {
  averagePriceByRegion: number;
  ukraineAveragePrice: number;
  counter: Counter;
}

@Injectable()
export class ResponseService {
  constructor(private readonly configService: ConfigService) {}
  createUserResponse(user: User): UserMapper {
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
  createCarResponse(car: Car): any {
    const carResponse = new CarMapper();
    carResponse.pathToPhoto = `${this.configService.get<string>(
      'AWS_S3_URL',
    )}/${car.pathToPhoto}`;
    return {
      ...car,
      pathToPhoto: carResponse.pathToPhoto,
      user: this.createUserResponse(car.user),
    };
  }
  createStatisticResponse(
    averagePriceByRegion: string,
    ukraineAveragePrice: string,
    counter: Counter,
  ): StaticMapper {
    const statisticResponse = new StaticMapper();
    statisticResponse.averagePriceByRegion = parseInt(averagePriceByRegion);
    statisticResponse.ukraineAveragePrice = parseInt(ukraineAveragePrice);
    statisticResponse.counter = counter;

    return statisticResponse;
  }
}
