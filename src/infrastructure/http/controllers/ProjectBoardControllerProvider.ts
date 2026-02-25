import { ProjectBoardUseCase } from '../../../application/use-cases/ProjectBoardUseCase';
import { EnvConfig } from '../../../config/env';
import { DynamoDbClient } from '../../persistence/dynamodb/client/dynamoDbClient';
import { DynamoDbProjectBoardRepository } from '../../persistence/dynamodb/repositories/DynamoDbProjectBoardRepository';
import { ProjectBoardController } from './ProjectBoardController';

let projectBoardControllerInstance: ProjectBoardController | null = null;

export const getProjectBoardController = (): ProjectBoardController => {
  if (projectBoardControllerInstance) {
    return projectBoardControllerInstance;
  }

  const env = EnvConfig.get();
  const dynamoClient = DynamoDbClient.create();
  const projectBoardRepository = new DynamoDbProjectBoardRepository(
    dynamoClient,
    env.dynamodbProjectBoardTableName
  );

  const projectBoardUseCase = new ProjectBoardUseCase(projectBoardRepository);

  projectBoardControllerInstance = new ProjectBoardController(projectBoardUseCase);

  return projectBoardControllerInstance;
};