import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
