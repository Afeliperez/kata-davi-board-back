import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ListBoardsUseCase } from './application/use-cases/ListBoardsUseCase';
import { BoardController } from './infrastructure/http/controllers/BoardController';
import { InMemoryBoardRepository } from './infrastructure/persistence/InMemoryBoardRepository';
import { DynamoDbClient } from './infrastructure/persistence/dynamodb/client/dynamoDbClient';
import { createApp } from './app';
import { EnvConfig } from './config/env';

const env = EnvConfig.get();
const port = env.port;

const boardRepository = new InMemoryBoardRepository();
const listBoardsUseCase = new ListBoardsUseCase(boardRepository);
const boardController = new BoardController(listBoardsUseCase);

const app = createApp(boardController);

const validateDynamoConnection = async (): Promise<void> => {
  const dynamoClient = DynamoDbClient.create();

  await dynamoClient.send(new ListTablesCommand({ Limit: 1 }));
};

const bootstrap = async (): Promise<void> => {
  try {
    await validateDynamoConnection();

    app.listen(port, () => {
      console.log(`HTTP server running on port ${port}`);
    });
  } catch (error) {
    const err = error as Error;
    console.error(`Failed to connect to DynamoDB: ${err.message}`);
    throw err;
  }
};

void bootstrap();