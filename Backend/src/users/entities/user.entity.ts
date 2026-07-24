import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { OneToOne } from 'typeorm';
import { Employee } from 'src/employees/entities/employee.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.EMPLOYEE,
  })
  role!: Role;

  // Allows administrators to deactivate a user
  // without deleting historical records.
  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;

  @OneToOne(() => Employee, (employee) => employee.user)
  employee?: Employee;

  // One-time password (OTP) used for password reset/change password.
  @Column({
    type: 'varchar',
    length: 6,
    nullable: true,
  })
  otp?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  otpExpiry?: Date;
}
