import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Human Resources',
    description: 'Department name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Handles employee management and recruitment',
    description: 'Department description',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;
}
