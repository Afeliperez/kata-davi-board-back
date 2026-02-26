import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export interface IEnvironmentConfig {
  nodeEnv: string;
  port: number;
  awsRegion: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  dynamodbEndpoint?: string;
  dynamodbUsersTableName: string;
  dynamodbProjectBoardTableName: string;
  apiPath: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export class EnvConfig {

  static get(): IEnvironmentConfig {
    return {
      nodeEnv: process.env.NODE_ENV ?? 'development',
      port: Number(process.env.PORT ?? 3000),
      awsRegion: process.env.AWS_REGION ?? 'us-east-1',
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
        dynamodbUsersTableName: process.env.DYNAMODB_USERS_TABLE_NAME ?? 'account-kata',
        dynamodbProjectBoardTableName:
          process.env.DYNAMODB_PROJECT_BOARD_TABLE_NAME ?? 'project-board',
        apiPath: process.env.API_PATH ?? 'kata-api',
        jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h'
      };
    }

  }