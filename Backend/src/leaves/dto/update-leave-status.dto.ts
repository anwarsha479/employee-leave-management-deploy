import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { LeaveStatus } from '../enums/leave-status.enum';

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: LeaveStatus,
    example: LeaveStatus.APPROVED,
    description: 'Leave request status',
  })
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;
}
