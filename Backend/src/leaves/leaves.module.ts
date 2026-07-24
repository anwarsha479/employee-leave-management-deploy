import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';

import { Leave } from './entities/leave.entity';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee])],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
