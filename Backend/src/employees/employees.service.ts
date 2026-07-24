import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UsersService } from '../users/users.service';
import { KeycloakService } from 'src/keycloak/keycloak.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly usersService: UsersService,
    private readonly keycloakService: KeycloakService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const email = createEmployeeDto.email.toLowerCase();
    const existingEmployee = await this.employeeRepository.findOne({
      where: [
        { email },
        {
          employeeCode: createEmployeeDto.employeeCode,
        },
      ],
    });

    if (existingEmployee) {
      throw new ConflictException('Employee already exists');
    }

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        'User account with this email already exists',
      );
    }

    const department = await this.departmentRepository.findOne({
      where: {
        id: createEmployeeDto.departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const defaultPassword = 'Password@123';
    const user = await this.usersService.create({
      email,
      password: defaultPassword,
    });
    await this.keycloakService.createUser(
      email,
      defaultPassword,
      createEmployeeDto.name,
    );

    try {
      const employee = this.employeeRepository.create({
        employeeCode: createEmployeeDto.employeeCode,
        name: createEmployeeDto.name,
        email,
        phone: createEmployeeDto.phone,
        designation: createEmployeeDto.designation,
        joiningDate: createEmployeeDto.joiningDate,
        department,
        user,
      });

      return await this.employeeRepository.save(employee);
    } catch (error) {
      await this.usersService.remove(user.id);
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    offset = 0,
    chunk = 10,
    search?: string,
    departmentId?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    const skip = offset;
    const query = this.employeeRepository.createQueryBuilder('employee');
    query.leftJoinAndSelect('employee.department', 'department');
    if (search) {
      query.andWhere('LOWER(employee.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (departmentId) {
      query.andWhere('department.id = :departmentId', {
        departmentId,
      });
    }

    const sortColumns = {
      employeeCode: 'employee.employeeCode',
      name: 'employee.name',
      email: 'employee.email',
      phone: 'employee.phone',
      designation: 'employee.designation',
      joiningDate: 'employee.joiningDate',
      department: 'department.name',
    };

    if (sortBy && sortColumns[sortBy]) {
      const orderField = sortColumns[sortBy];
      const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(orderField, orderDirection);
    } else {
      query.orderBy('employee.createdAt', 'DESC');
    }

    query.skip(skip).take(chunk);
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

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
      },
      relations: {
        department: true,
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async getMyProfile(userId: string) {
    const employee = await this.employeeRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
        department: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      department: employee.department?.name,
      role: employee.user?.role,
      profileImage: employee.profileImage,
    };
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    const email = updateEmployeeDto.email?.toLowerCase();

    if (email && email !== employee.email) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: {
          email,
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Email already in use by another employee');
      }

      const existingUser = await this.usersService.findByEmail(email);

      if (
        existingUser &&
        (!employee.user || existingUser.id !== employee.user.id)
      ) {
        throw new ConflictException('Email already in use by another user');
      }

      if (employee.user) {
        await this.usersService.update(employee.user.id, {
          email,
        });
      }
    }

    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: {
          id: updateEmployeeDto.departmentId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      employee.department = department;
    }

    await this.keycloakService.updateUser(
      employee.email,
      email ?? employee.email,
      updateEmployeeDto.name ?? employee.name,
    );

    Object.assign(employee, {
      employeeCode: updateEmployeeDto.employeeCode ?? employee.employeeCode,
      name: updateEmployeeDto.name ?? employee.name,
      email: email ?? employee.email,
      phone: updateEmployeeDto.phone ?? employee.phone,
      designation: updateEmployeeDto.designation ?? employee.designation,
      joiningDate: updateEmployeeDto.joiningDate ?? employee.joiningDate,
    });

    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    const userId = employee.user?.id;
    await this.keycloakService.deleteUser(employee.email);
    await this.employeeRepository.remove(employee);
    if (userId) {
      await this.usersService.remove(userId);
    }
  }

  async uploadProfileImage(
    id: string,
    filename: string,
    userId: string,
    role: string,
  ) {
    const employee = await this.findOne(id);

    if (role === 'EMPLOYEE') {
      const myEmployee = await this.employeeRepository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
        relations: {
          user: true,
        },
      });

      if (!myEmployee || myEmployee.id !== id) {
        throw new ForbiddenException(
          'You cannot upload another employee profile picture',
        );
      }
    }

    employee.profileImage = filename;
    return this.employeeRepository.save(employee);
  }
}
