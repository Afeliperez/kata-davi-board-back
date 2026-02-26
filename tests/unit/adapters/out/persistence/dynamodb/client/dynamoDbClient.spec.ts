const fromMock = jest.fn(() => ({ kind: 'doc-client' }));
const dynamoClientCtor = jest.fn((config) => ({ config }));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: dynamoClientCtor
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: fromMock
  }
}));

import { EnvConfig } from '@config/env';
import { DynamoDbClient } from '@adapters/out/persistence/dynamodb/client/dynamoDbClient';

describe('DynamoDbClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('creates document client with static credentials when keys exist', () => {
    jest.spyOn(EnvConfig, 'get').mockReturnValue({
      nodeEnv: 'test',
      port: 3000,
      awsRegion: 'us-east-1',
      awsAccessKeyId: 'access-key',
      awsSecretAccessKey: 'secret-key',
      dynamodbEndpoint: 'http://localhost:8000',
      dynamodbUsersTableName: 'users',
      dynamodbProjectBoardTableName: 'boards',
      apiPath: 'kata-api',
      jwtSecret: 'secret',
      jwtExpiresIn: '1h'
    });

    const result = DynamoDbClient.create();

    expect(dynamoClientCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'us-east-1',
        endpoint: 'http://localhost:8000',
        credentials: {
          accessKeyId: 'access-key',
          secretAccessKey: 'secret-key'
        }
      })
    );
    expect(fromMock).toHaveBeenCalledWith(
      expect.objectContaining({ config: expect.any(Object) }),
      expect.objectContaining({
        marshallOptions: { removeUndefinedValues: true }
      })
    );
    expect(result).toEqual({ kind: 'doc-client' });
  });

  it('creates client without credentials when keys are absent', () => {
    jest.spyOn(EnvConfig, 'get').mockReturnValue({
      nodeEnv: 'test',
      port: 3000,
      awsRegion: 'us-east-1',
      awsAccessKeyId: undefined,
      awsSecretAccessKey: undefined,
      dynamodbEndpoint: undefined,
      dynamodbUsersTableName: 'users',
      dynamodbProjectBoardTableName: 'boards',
      apiPath: 'kata-api',
      jwtSecret: 'secret',
      jwtExpiresIn: '1h'
    });

    DynamoDbClient.create({ maxAttempts: 5 });

    expect(dynamoClientCtor).toHaveBeenCalledWith(
      expect.objectContaining({
        region: 'us-east-1',
        maxAttempts: 5
      })
    );
    const passedConfig = dynamoClientCtor.mock.calls[0][0];
    expect(passedConfig.credentials).toBeUndefined();
  });
});
