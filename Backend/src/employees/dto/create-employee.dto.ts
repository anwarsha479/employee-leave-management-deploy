import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'EMP001',
    description: 'Unique employee code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  employeeCode!: string;

  @ApiProperty({
    example: 'Anwarsha',
    description: 'Employee full name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'anwar@gmail.com',
    description: 'Employee email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Employee phone number',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @ApiProperty({
    example: 'Software Developer',
    description: 'Employee designation',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  designation!: string;

  @ApiProperty({
    example: '648bc34f-0813-4b89-bf46-72ad11d9fb8b',
    description: 'Department ID',
  })
  @IsUUID()
  departmentId!: string;

  @ApiProperty({
    example: '2026-06-12',
    description: 'Employee joining date',
  })
  @IsDateString()
  joiningDate!: Date;
}
