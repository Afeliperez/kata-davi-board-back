export interface TokenService {
  sign(payload: Record<string, string>): string;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}