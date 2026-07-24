import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Leave } from '../leaves/entities/leave.entity';
import { LeaveStatus } from '../leaves/enums/leave-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
  ) {}

  async getStats() {
    const totalEmployees = await this.employeeRepository.count();
    const totalDepartments = await this.departmentRepository.count();
    const totalLeaves = await this.leaveRepository.count();
    const pendingLeaves = await this.leaveRepository.count({
      where: {
        status: LeaveStatus.PENDING,
      },
    });

    const approvedLeaves = await this.leaveRepository.count({
      where: {
        status: LeaveStatus.APPROVED,
      },
    });

    const rejectedLeaves = await this.leaveRepository.count({
      where: {
        status: LeaveStatus.REJECTED,
      },
    });

    return {
      totalEmployees,
      totalDepartments,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
    };
  }

  async getEmployeeStats(userId: string) {
    const appliedLeaves = await this.leaveRepository.count({
      where: {
        employee: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        employee: {
          user: true,
        },
      },
    });

    const approvedLeaves = await this.leaveRepository.count({
      where: {
        employee: {
          user: {
            id: userId,
          },
        },
        status: LeaveStatus.APPROVED,
      },
      relations: {
        employee: {
          user: true,
        },
      },
    });

    const rejectedLeaves = await this.leaveRepository.count({
      where: {
        employee: {
          user: {
            id: userId,
          },
        },
        status: LeaveStatus.REJECTED,
      },
      relations: {
        employee: {
          user: true,
        },
      },
    });

    const remainingLeaves = 24 - approvedLeaves;

    return {
      appliedLeaves,
      approvedLeaves,
      rejectedLeaves,
      remainingLeaves,
    };
  }

  async getEmployeesByDepartment() {
    return this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin(
        'employees',
        'employee',
        'employee.departmentId = department.id',
      )
      .select('department.name', 'department')
      .addSelect('COUNT(employee.id)', 'count')
      .groupBy('department.id')
      .orderBy('department.name', 'ASC')
      .getRawMany();
  }
}
