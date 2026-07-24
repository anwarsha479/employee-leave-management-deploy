import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email!: string;
}
