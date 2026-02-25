import { UserUseCase } from '../../../application/use-cases/UserUseCase';
import { EnvConfig } from '../../../config/env';
import { DynamoDbClient } from '../../persistence/dynamodb/client/dynamoDbClient';
import { DynamoDbUserRepository } from '../../persistence/dynamodb/repositories/DynamoDbUserRepository';
import { JwtTokenService } from '../../security/JwtTokenService';
import { UserController } from './UserController';

let userControllerInstance: UserController | null = null;

export const getUserController = (): UserController => {
  if (userControllerInstance) {
    return userControllerInstance;
  }

  const env = EnvConfig.get();
  const dynamoClient = DynamoDbClient.create();
  const userRepository = new DynamoDbUserRepository(dynamoClient, env.dynamodbUsersTableName);

  const tokenService = new JwtTokenService();
  const userUseCase = new UserUseCase(userRepository, tokenService);

  userControllerInstance = new UserController(userUseCase);

  return userControllerInstance;
};