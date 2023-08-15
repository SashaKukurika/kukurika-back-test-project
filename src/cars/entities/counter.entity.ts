import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Car } from './car.entity';

@Entity()
export class Counter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  viewsPerDay: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  viewsPerWeek: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  viewsPerMonth: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  views: number;

  @OneToOne(() => Car)
  @JoinColumn()
  car: Car;
}
