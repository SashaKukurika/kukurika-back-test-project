import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Car } from '../../cars/entities/car.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable mean that it can't be empty when it's false
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'boolean', default: false })
  premiumAccount: boolean;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @OneToMany(() => Car, (car) => car.user)
  cars: Car[];
}
