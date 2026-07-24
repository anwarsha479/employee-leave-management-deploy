import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { LeaveStatus } from './enums/leave-status.enum';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // Employee can apply leave
  @Post()
  create(
    @Body()
    createLeaveDto: CreateLeaveDto,

    @Req()
    req: Request & {
      user: {
        userId: string;
        email: string;
        role: string;
      };
    },
  ) {
    return this.leavesService.create(createLeaveDto, req.user.userId);
  }

  // Admin can view all leaves
  @Get()
  findAll(
    @Req() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('chunk') chunk?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('status') status?: string,
  ) {
    const role = req.user.role;
    const userId = req.user.userId;

    return this.leavesService.findAll(
      page,
      limit,
      offset,
      chunk,
      search,
      role,
      userId,
      sortBy,
      sortOrder,
      status,
    );
  }
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  exportLeaves(@Res() res: any) {
    return this.leavesService.exportLeaves(res);
  }

  // Admin can view leave details
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.leavesService.findOne(id);
  }

  // Admin only
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  approve(
    @Param('id')
    id: string,
  ) {
    return this.leavesService.updateStatus(id, LeaveStatus.APPROVED);
  }

  // Admin only
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reject(
    @Param('id')
    id: string,
  ) {
    return this.leavesService.updateStatus(id, LeaveStatus.REJECTED);
  }
}
