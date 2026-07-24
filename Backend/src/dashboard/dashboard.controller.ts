import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('employee')
  getEmployeeStats(
    @Req()
    req: Request & {
      user: {
        userId: string;
      };
    },
  ) {
    return this.dashboardService.getEmployeeStats(req.user.userId);
  }

  @Get('employees-by-department')
  getEmployeesByDepartment() {
    return this.dashboardService.getEmployeesByDepartment();
  }
}
