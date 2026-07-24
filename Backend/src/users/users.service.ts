import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from 'src/employees/entities/employee.entity';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    // Never store plain-text passwords.
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      // Newly created users are employees by default.
      role: Role.EMPLOYEE,
    });
    return this.userRepository.save(user);
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (user) {
      await this.userRepository.remove(user);
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        employee: true,
      },
    });
    user;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email) {
      const email = updateProfileDto.email.toLowerCase();

      user.email = email;

      if (user.employee) {
        user.employee.email = email;
      }
    }

    await this.userRepository.save(user);

    if (user.employee) {
      if (updateProfileDto.name) {
        user.employee.name = updateProfileDto.name;
      }

      if (updateProfileDto.phone) {
        user.employee.phone = updateProfileDto.phone;
      }

      await this.employeeRepository.save(user.employee);
    }

    return {
      message: 'Profile updated successfully',
    };
  }
}
