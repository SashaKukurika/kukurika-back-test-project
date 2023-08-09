import { Injectable } from '@nestjs/common';

import { CreateCarDto } from './dto/create-car.dto';

@Injectable()
export class CarsService {
  create(createCarDto: CreateCarDto) {
    return createCarDto;
  }

  findAll() {
    return `This action returns all cars`;
  }

  findOne(id: number) {
    return `This action returns a #${id} car`;
  }

  update(id: number, updateCarDto: CreateCarDto) {
    return `This action updates a #${updateCarDto} car`;
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}
