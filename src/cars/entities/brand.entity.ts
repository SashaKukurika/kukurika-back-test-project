import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Model } from './model.entity';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable mean that it can't be empty when it's false
  @Column({ type: 'varchar', nullable: false, unique: true })
  name: string;

  @OneToMany(() => Model, (model) => model.brand)
  models: Model[];
}
