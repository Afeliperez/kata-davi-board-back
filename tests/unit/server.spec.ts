const listenMock = jest.fn();
const sendMock = jest.fn();

jest.mock('@app', () => ({
  createApp: jest.fn(() => ({
    listen: listenMock
  }))
}));

jest.mock('@main/httpDependencyInjection', () => ({
  createHttpDependencies: jest.fn(() => ({}))
}));

jest.mock('@adapters/out/persistence/dynamodb/client/dynamoDbClient', () => ({
  DynamoDbClient: {
    create: jest.fn(() => ({ send: sendMock }))
  }
}));

jest.mock('@config/env', () => ({
  EnvConfig: {
    get: jest.fn(() => ({
      nodeEnv: 'test',
      port: 3010,
      awsRegion: 'us-east-1',
      awsAccessKeyId: undefined,
      awsSecretAccessKey: undefined,
      dynamodbEndpoint: undefined,
      dynamodbUsersTableName: 'users',
      dynamodbProjectBoardTableName: 'boards',
      apiPath: 'kata-api',
      jwtSecret: 'secret',
      jwtExpiresIn: '1h'
    }))
  }
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  ListTablesCommand: jest.fn().mockImplementation((input) => ({ input }))
}));

describe('server bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    sendMock.mockResolvedValue({});
  });

  it('validates dynamo connection and starts listening on configured port', async () => {
    require('@/server');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith(3010, expect.any(Function));
  });
});
