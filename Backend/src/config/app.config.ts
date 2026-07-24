import { ConfigService } from '@nestjs/config';

export const appConfig = (configService: ConfigService) => ({
  port: configService.getOrThrow<number>('PORT'),

  frontendUrl: configService.getOrThrow<string>('FRONTEND_URL'),
});
