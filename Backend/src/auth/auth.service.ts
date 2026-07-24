import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from 'src/email/email.service';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
    };
  }

  async keycloakLogin(token: string) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const client = jwksClient({
      jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
    });

    const decoded: any = jwt.decode(token, {
      complete: true,
    });

    const key = await client.getSigningKey(decoded.header.kid);
    const signingKey = key.getPublicKey();
    const payload: any = jwt.verify(token, signingKey);
    const email = payload.email;
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: forgotPasswordDto.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new BadRequestException('Email is not registered');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.save(user);
    console.log('====================================');
    console.log(`Email: ${user.email}`);
    console.log(`OTP: ${otp}`);
    console.log('====================================');

    await this.emailService.sendOtpEmail(user.email, otp);
    return {
      message: 'OTP sent successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: resetPasswordDto.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    if (user.otp !== resetPasswordDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    user.password = await bcrypt.hash(resetPasswordDto.password, 10);
    user.otp = null as any;
    user.otpExpiry = null as any;
    await this.userRepository.save(user);

    return {
      message: 'Password reset successful',
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);
    return {
      message: 'Password changed successfully',
    };
  }
}
