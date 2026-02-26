import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtTokenService } from '@adapters/out/security/JwtTokenService';
import { EnvConfig } from '@config/env';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('JwtTokenService', () => {
  const service = new JwtTokenService();

  beforeEach(() => {
    jest.spyOn(EnvConfig, 'get').mockReturnValue({
      nodeEnv: 'test',
      port: 3000,
      awsRegion: 'us-east-1',
      awsAccessKeyId: 'key',
      awsSecretAccessKey: 'secret',
      dynamodbEndpoint: 'http://localhost:8000',
      dynamodbUsersTableName: 'users',
      dynamodbProjectBoardTableName: 'boards',
      apiPath: 'kata-api',
      jwtSecret: 'jwt-secret',
      jwtExpiresIn: '2h'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('signs payload with env secret and expiration', () => {
    (jwt.sign as jest.Mock).mockReturnValue('signed-token');

    const result = service.sign({ cc: '1001', role: 'QA' });

    expect(jwt.sign).toHaveBeenCalledWith({ cc: '1001', role: 'QA' }, 'jwt-secret', {
      expiresIn: '2h'
    });
    expect(result).toBe('signed-token');
  });

  it('hashes password with bcrypt rounds 10', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const result = await service.hashPassword('plain');

    expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
    expect(result).toBe('hashed');
  });

  it('verifies password using bcrypt.compare', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.verifyPassword('plain', 'hashed');

    expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
    expect(result).toBe(true);
  });
});
