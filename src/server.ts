import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDbClient } from './adapters/out/persistence/dynamodb/client/dynamoDbClient';
import { createHttpDependencies } from './main/httpDependencyInjection';
import { createApp } from './app';
import { EnvConfig } from './config/env';

const env = EnvConfig.get();
const port = env.port;

const app = createApp(createHttpDependencies());

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