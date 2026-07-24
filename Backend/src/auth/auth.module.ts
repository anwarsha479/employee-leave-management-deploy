import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { EmailModule } from 'src/email/email.module';
import { jwtConfig } from 'src/config/jwt.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, PassportModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
