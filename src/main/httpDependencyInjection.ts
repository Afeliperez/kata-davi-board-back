import { ProjectBoardUseCase } from '@application/use-cases/projectBoardUseCase';
import { UserUseCase } from '@application/use-cases/userUseCase';
import { EnvConfig } from '@config/env';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';
import { UserController } from '@adapters/in/http/controllers/userController';
import { DynamoDbClient } from '@adapters/out/persistence/dynamodb/client/dynamoDbClient';
import { DynamoDbProjectBoardRepository } from '@adapters/out/persistence/dynamodb/repositories/dynamoDbProjectBoardRepository';
import { DynamoDbUserRepository } from '@adapters/out/persistence/dynamodb/repositories/dynamoDbUserRepository';
import { JwtTokenService } from '@adapters/out/security/JwtTokenService';

export interface IHttpDependencies {
  projectBoardController: ProjectBoardController;
  userController: UserController;
}

export const createHttpDependencies = (): IHttpDependencies => {
  const env = EnvConfig.get();
  const dynamoClient = DynamoDbClient.create();

  const projectBoardRepository = new DynamoDbProjectBoardRepository(
    dynamoClient,
    env.dynamodbProjectBoardTableName
  );
  const userRepository = new DynamoDbUserRepository(dynamoClient, env.dynamodbUsersTableName);

  const projectBoardUseCase = new ProjectBoardUseCase(projectBoardRepository);
  const userUseCase = new UserUseCase(userRepository, new JwtTokenService());

  return {
    projectBoardController: new ProjectBoardController(projectBoardUseCase),
    userController: new UserController(userUseCase)
  };
};