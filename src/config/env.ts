import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  awsRegion: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  dynamodbEndpoint?: string;
  dynamodbTableName: string;
  dynamodbUsersTableName: string;
  apiPath: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin?: string;
}

export class EnvConfig {

  static get(): EnvironmentConfig {
    return {
      nodeEnv: process.env.NODE_ENV ?? 'development',
      port: Number(process.env.PORT ?? 3000),
      awsRegion: process.env.AWS_REGION ?? 'us-east-1',
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
        dynamodbTableName: process.env.DYNAMODB_TABLE_NAME ?? 'boards',
        dynamodbUsersTableName: process.env.DYNAMODB_USERS_TABLE_NAME ?? 'account-kata',
        corsOrigin: process.env.CORS_ORIGIN,
        apiPath: process.env.API_PATH ?? 'kata-api',
        jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h'
      };
    }

  }