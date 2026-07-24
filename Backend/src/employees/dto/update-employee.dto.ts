import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UpdateEmployeeDto {
  @ApiProperty({
    example: 'EMP001',
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({
    example: 'Anwarsha',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'anwar@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '9876543210',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Senior Software Developer',
    required: false,
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty({
    example: '648bc34f-0813-4b89-bf46-72ad11d9fb8b',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({
    example: '2026-06-12',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  joiningDate?: Date;
}
