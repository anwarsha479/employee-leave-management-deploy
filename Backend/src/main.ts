import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = appConfig(configService);
  app.use(cookieParser());
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: config.frontendUrl,
    credentials: true,
  });

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Employee Leave Management API')
    .setDescription('Employee Leave Management System APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);

  const port = config.port;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
