describe('EnvConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns defaults when env vars are not set', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.AWS_REGION;
    delete process.env.DYNAMODB_USERS_TABLE_NAME;
    delete process.env.DYNAMODB_PROJECT_BOARD_TABLE_NAME;
    delete process.env.API_PATH;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;

    jest.doMock('dotenv', () => ({
      __esModule: true,
      default: { config: jest.fn() }
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EnvConfig } = require('@config/env');
    const env = EnvConfig.get();

    expect(env.nodeEnv).toBe('development');
    expect(env.port).toBe(3000);
    expect(env.awsRegion).toBe('us-east-1');
    expect(env.dynamodbEndpoint).toBeUndefined();
    expect(env.dynamodbUsersTableName).toBe('account-kata');
    expect(env.dynamodbProjectBoardTableName).toBe('project-board');
    expect(env.apiPath).toBe('kata-api');
    expect(env.jwtSecret).toBe('dev-secret-change-me');
    expect(env.jwtExpiresIn).toBe('1h');
  });

  it('returns configured values from environment', () => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '4001';
    process.env.AWS_REGION = 'eu-west-3';
    process.env.DYNAMODB_ENDPOINT = 'http://localhost:9000';
    process.env.DYNAMODB_USERS_TABLE_NAME = 'users-test';
    process.env.DYNAMODB_PROJECT_BOARD_TABLE_NAME = 'boards-test';
    process.env.API_PATH = 'v1';
    process.env.JWT_SECRET = 'secret-test';
    process.env.JWT_EXPIRES_IN = '30m';

    jest.doMock('dotenv', () => ({
      __esModule: true,
      default: { config: jest.fn() }
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EnvConfig } = require('@config/env');
    const env = EnvConfig.get();

    expect(env.nodeEnv).toBe('test');
    expect(env.port).toBe(4001);
    expect(env.awsRegion).toBe('eu-west-3');
    expect(env.dynamodbEndpoint).toBe('http://localhost:9000');
    expect(env.dynamodbUsersTableName).toBe('users-test');
    expect(env.dynamodbProjectBoardTableName).toBe('boards-test');
    expect(env.apiPath).toBe('v1');
    expect(env.jwtSecret).toBe('secret-test');
    expect(env.jwtExpiresIn).toBe('30m');
  });
});
