import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { EnvConfig } from '../../config/env';
import { TokenService } from '../../domain/services/TokenService';

export class JwtTokenService implements TokenService {
  sign(payload: Record<string, string>): string {
    const env = EnvConfig.get();

    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn']
    });
  }

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}