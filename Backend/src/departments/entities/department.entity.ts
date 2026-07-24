import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 100,
  })
  name!: string;

  @Column({
    length: 500,
  })
  description!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees!: Employee[];
}
