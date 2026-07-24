import { ConfigService } from '@nestjs/config';

export const emailConfig = (configService: ConfigService) => ({
  apiKey: configService.get<string>('RESEND_API_KEY'),
});
