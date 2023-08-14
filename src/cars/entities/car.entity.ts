import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable mean that it can't be empty when it's false
  @Column({ type: 'varchar', nullable: false })
  brand: string;

  @Column({ type: 'varchar', nullable: false })
  model: string;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  userPrice: number;

  @Column({ type: 'varchar', nullable: false, default: 'UAH' })
  userCurrency: string;

  @Column({ type: 'varchar', nullable: false, default: 1 })
  currencyRate: string;

  @Column({ type: 'varchar', nullable: false })
  advertisementText: string;

  @Column({ type: 'varchar', nullable: true })
  pathToPhoto: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.cars)
  user: User;
}
