import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Brand } from './brand.entity';

@Entity()
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable mean that it can't be empty when it's false
  @Column({ type: 'varchar', nullable: false, unique: true })
  name: string;

  @ManyToOne(() => Brand, (brand) => brand.models)
  brand: Brand;
}
