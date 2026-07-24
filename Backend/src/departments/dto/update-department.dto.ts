import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiProperty({
    example: 'Information Technology',
    description: 'Updated department name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Handles software development and technical support',
    description: 'Updated department description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
