import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'User account password',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
