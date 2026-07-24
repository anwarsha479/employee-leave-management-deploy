import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

import { Employee } from './entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { UsersModule } from '../users/users.module';
import { KeycloakService } from 'src/keycloak/keycloak.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department]), UsersModule],
  controllers: [EmployeesController],
  providers: [EmployeesService, KeycloakService],
})
export class EmployeesModule {}
