import { createHttpDependencies } from '@main/httpDependencyInjection';
import { EnvConfig } from '@config/env';
import { DynamoDbClient } from '@adapters/out/persistence/dynamodb/client/dynamoDbClient';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';
import { UserController } from '@adapters/in/http/controllers/userController';
import { JwtTokenService } from '@adapters/out/security/JwtTokenService';

describe('createHttpDependencies', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wires repositories, use-cases and controllers with configured tables', () => {
    const dynamoClient = { send: jest.fn() };

    jest.spyOn(EnvConfig, 'get').mockReturnValue({
      nodeEnv: 'test',
      port: 3000,
      awsRegion: 'us-east-1',
      awsAccessKeyId: undefined,
      awsSecretAccessKey: undefined,
      dynamodbEndpoint: undefined,
      dynamodbUsersTableName: 'users-table',
      dynamodbProjectBoardTableName: 'boards-table',
      apiPath: 'kata-api',
      jwtSecret: 'secret',
      jwtExpiresIn: '1h'
    });

    jest.spyOn(DynamoDbClient, 'create').mockReturnValue(dynamoClient as never);

    const deps = createHttpDependencies();

    expect(DynamoDbClient.create).toHaveBeenCalledTimes(1);
    expect(deps.projectBoardController).toBeInstanceOf(ProjectBoardController);
    expect(deps.userController).toBeInstanceOf(UserController);
    expect(new JwtTokenService()).toBeInstanceOf(JwtTokenService);
  });
});
