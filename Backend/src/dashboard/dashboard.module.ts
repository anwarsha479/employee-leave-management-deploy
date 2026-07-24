import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Employee } from '../employees/entities/employee.entity';
import { Department } from '../departments/entities/department.entity';
import { Leave } from '../leaves/entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Leave])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
