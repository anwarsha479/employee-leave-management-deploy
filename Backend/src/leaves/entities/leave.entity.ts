import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveStatus } from '../enums/leave-status.enum';
import { LeaveType } from '../enums/leave-type.enum';

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'date',
  })
  startDate!: Date;

  @Column({
    type: 'date',
  })
  endDate!: Date;

  @Column({
    length: 500,
  })
  reason!: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType!: LeaveType;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status!: LeaveStatus;

  @ManyToOne(() => Employee, {
    nullable: false,
  })
  @JoinColumn({
    name: 'employeeId',
  })
  employee!: Employee;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
