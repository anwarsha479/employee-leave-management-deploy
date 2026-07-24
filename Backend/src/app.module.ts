import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { EmployeesModule } from './employees/employees.module';
import { LeavesModule } from './leaves/leaves.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './email/email.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    UsersModule,
    AuthModule,
    DepartmentsModule,
    EmployeesModule,
    LeavesModule,
    DashboardModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
