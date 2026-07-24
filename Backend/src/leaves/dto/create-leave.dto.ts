import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { LeaveType } from '../enums/leave-type.enum';

export class CreateLeaveDto {
  @IsOptional()
  @IsUUID()
  employeeId!: string;

  @ApiProperty({
    example: LeaveType.CASUAL,
    enum: LeaveType,
    description: 'Type of leave',
  })
  @IsEnum(LeaveType)
  leaveType!: LeaveType;

  @ApiProperty({
    example: '2026-06-15',
    description: 'Leave start date',
  })
  @IsDateString()
  startDate!: Date;

  @ApiProperty({
    example: '2026-06-17',
    description: 'Leave end date',
  })
  @IsDateString()
  endDate!: Date;

  @ApiProperty({
    example: 'Personal work',
    description: 'Reason for leave request',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}
