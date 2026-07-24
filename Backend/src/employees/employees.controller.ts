import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('employees')
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body()
    createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(createEmployeeDto);
  }
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(':id/profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  uploadProfileImage(
    @Param('id')
    id: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Req()
    req: Request & {
      user: {
        userId: string;
        role: string;
      };
    },
  ) {
    return this.employeesService.uploadProfileImage(
      id,
      file.filename,
      req.user.userId,
      req.user.role,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('chunk') chunk?: number,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.employeesService.findAll(
      page,
      limit,
      offset,
      chunk,
      search,
      departmentId,
      sortBy,
      sortOrder,
    );
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(
    @Req()
    req: Request & {
      user: {
        userId: string;
      };
    },
  ) {
    return this.employeesService.getMyProfile(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id')
    id: string,
    @Body()
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(
    @Param('id')
    id: string,
  ) {
    return this.employeesService.remove(id);
  }
}
