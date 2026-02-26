import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { EnvConfig } from '../../../../../config/env';

export class DynamoDbClient {
  static create(config?: DynamoDBClientConfig): DynamoDBDocumentClient {
    const env = EnvConfig.get();
    const hasStaticCredentials = Boolean(env.awsAccessKeyId && env.awsSecretAccessKey);

    const credentials = hasStaticCredentials
      ? {
          accessKeyId: env.awsAccessKeyId as string,
          secretAccessKey: env.awsSecretAccessKey as string
        }
      : undefined;

    const clientConfig: DynamoDBClientConfig = {
      region: env.awsRegion,
      endpoint: env.dynamodbEndpoint,
      ...config,
      ...(credentials ? { credentials } : {})
    };

    const dynamoClient = new DynamoDBClient(clientConfig);

    return DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });
  }
}