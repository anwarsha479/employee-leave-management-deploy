import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from './entities/leave.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LeaveStatus } from './enums/leave-status.enum';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(
    createLeaveDto: CreateLeaveDto,
    userId?: string,
  ): Promise<Leave> {
    let employee: Employee | null = null;

    // Admin case
    if (createLeaveDto.employeeId) {
      employee = await this.employeeRepository.findOne({
        where: {
          id: createLeaveDto.employeeId,
        },
      });
    }
    // Employee case
    else if (userId) {
      employee = await this.employeeRepository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
        relations: {
          user: true,
        },
      });
    }

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(createLeaveDto.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new BadRequestException('Cannot apply leave for past dates');
    }

    const endDate = new Date(createLeaveDto.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }
    const leave = this.leaveRepository.create({
      leaveType: createLeaveDto.leaveType,
      startDate: createLeaveDto.startDate,
      endDate: createLeaveDto.endDate,
      reason: createLeaveDto.reason,
      employee,
    });

    return this.leaveRepository.save(leave);
  }

  async findAll(
    page = 1,
    limit = 10,
    offset = 0,
    chunk = 10,
    search?: string,
    role?: string,
    userId?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
    status?: string,
    employeeId?: string,
  ) {
    const skip = offset;
    const take = chunk;

    const query = this.leaveRepository.createQueryBuilder('leave');

    query.leftJoinAndSelect('leave.employee', 'employee');

    query.leftJoinAndSelect('employee.user', 'user');

    if (search) {
      query.andWhere('LOWER(employee.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      query.andWhere('leave.status = :status', {
        status,
      });
    }

    if (employeeId) {
      query.andWhere('employee.id = :employeeId', {
        employeeId,
      });
    }

    // Employee can only see their own leaves
    if (role === 'EMPLOYEE' && userId) {
      query.andWhere('user.id = :userId', {
        userId,
      });
    }

    const sortColumns = {
      employee: 'employee.name',
      startDate: 'leave.startDate',
      endDate: 'leave.endDate',
      reason: 'leave.reason',
      status: 'leave.status',
    };

    if (sortBy && sortColumns[sortBy]) {
      const orderField = sortColumns[sortBy];
      const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(orderField, orderDirection);
    } else {
      query.orderBy('leave.createdAt', 'DESC');
    }

    query.skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      offset,
      chunk,
      limit,
      hasMore: offset + data.length < total,
    };
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: {
        id,
      },
      relations: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave not found');
    }

    return leave;
  }

  async updateStatus(id: string, status: LeaveStatus): Promise<Leave> {
    const leave = await this.findOne(id);

    leave.status = status;

    return this.leaveRepository.save(leave);
  }

  async exportLeaves(res: Response) {
    const leaves = await this.leaveRepository.find({
      relations: {
        employee: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Leave Requests');

    worksheet.columns = [
      {
        header: 'Employee',
        key: 'employee',
        width: 25,
      },
      {
        header: 'Leave Type',
        key: 'leaveType',
        width: 20,
      },
      {
        header: 'Start Date',
        key: 'startDate',
        width: 20,
      },
      {
        header: 'End Date',
        key: 'endDate',
        width: 20,
      },
      {
        header: 'Reason',
        key: 'reason',
        width: 40,
      },
      {
        header: 'Status',
        key: 'status',
        width: 20,
      },
    ];

    leaves.forEach((leave) => {
      worksheet.addRow({
        employee: leave.employee?.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=leave-requests.xlsx',
    );

    await workbook.xlsx.write(res);

    res.end();
  }
}
