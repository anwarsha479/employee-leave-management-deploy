import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Put,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from 'src/users/dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { KeycloakLoginDto } from './dto/keycloak-login.dto';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookie(response: Response, accessToken: string) {
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    this.setAuthCookie(response, result.accessToken);

    return {
      message: 'Login successful',
    };
  }

  @Post('keycloak-login')
  async keycloakLogin(
    @Body() body: KeycloakLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.keycloakLogin(body.token);

    this.setAuthCookie(response, result.accessToken);

    return {
      message: 'Keycloak login successful',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');

    return {
      message: 'Logout successful',
    };
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req()
    req: Request & {
      user: {
        userId: string;
      };
    },
    @Body()
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req()
    req: Request & {
      user: {
        userId: string;
      };
    },
    @Body()
    updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }
}
