import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { emailConfig } from 'src/config/email.config';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const config = emailConfig(this.configService);

    this.resend = new Resend(config.apiKey);
  }

  async sendOtpEmail(email: string, otp: string) {
    try {
      const result = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Password Reset OTP',
        html: `
        <h2>Employee Leave Management System</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
      });

      console.log('Resend Result:', result);
    } catch (error) {
      console.error('Resend Error:', error);
      throw error;
    }
  }
}
