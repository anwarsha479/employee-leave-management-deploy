import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP',
  })
  @IsNotEmpty()
  otp!: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New account password',
  })
  @MinLength(8)
  password!: string;
}
