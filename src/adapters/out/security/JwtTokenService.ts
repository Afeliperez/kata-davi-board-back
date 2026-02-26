import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { EnvConfig } from '../../../config/env';
import { ITokenService } from '../../../domain/services/tokenService';

export class JwtTokenService implements ITokenService {
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