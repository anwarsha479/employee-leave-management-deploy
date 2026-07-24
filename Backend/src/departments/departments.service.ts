import { Injectable, ConflictException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const existingDepartment = await this.departmentRepository.findOne({
      where: {
        name: createDepartmentDto.name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException('Department already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);

    return this.departmentRepository.save(department);
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: ILike(`%${search}%`),
        }
      : {};

    const [data, total] = await this.departmentRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findOne(id);

    Object.assign(department, updateDepartmentDto);

    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);

    await this.departmentRepository.remove(department);
  }
}
