import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { ICreateUser, Role, IUser } from '../../../../../domain/entities/User';
import { IUserRepository } from '../../../../../domain/repositories/userRepository';
import { IUserItem, UserItemMapper } from '../mappers/userItemMapper';

export class DynamoDbUserRepository implements IUserRepository {
  constructor(
    private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(user: ICreateUser): Promise<void> {
    await this.dynamoClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: UserItemMapper.toItem(user),
        ConditionExpression: 'attribute_not_exists(cc)'
      })
    );
  }

  async listAll(): Promise<IUser[]> {
    const result = await this.dynamoClient.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items
      .filter((item) => String((item as IUserItem).role).toUpperCase() !== Role.ADMIN)
      .map((item) => UserItemMapper.toDomain(item as IUserItem));
  }

  async getByCcWithPassword(cc: string): Promise<ICreateUser | null> {
    const result = await this.dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { cc }
      })
    );

    if (!result.Item) {
      return null;
    }

    return UserItemMapper.toCreateUser(result.Item as IUserItem);
  }

  async getByCc(cc: string): Promise<IUser | null> {
    const result = await this.dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { cc }
      })
    );

    if (!result.Item) {
      return null;
    }

    return UserItemMapper.toDomain(result.Item as IUserItem);
  }

  async update(cc: string, data: Partial<ICreateUser>): Promise<IUser | null> {
    const expressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    if (data.email !== undefined) {
      expressionParts.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = data.email;
    }

    if (data.password !== undefined) {
      expressionParts.push('#password = :password');
      expressionAttributeNames['#password'] = 'password';
      expressionAttributeValues[':password'] = data.password;
    }

    if (data.userName !== undefined) {
      expressionParts.push('#userName = :userName');
      expressionAttributeNames['#userName'] = 'userName';
      expressionAttributeValues[':userName'] = data.userName;
    }

    if (data.role !== undefined) {
      expressionParts.push('#role = :role');
      expressionAttributeNames['#role'] = 'role';
      expressionAttributeValues[':role'] = data.role;
    }

    if (expressionParts.length === 0) {
      return this.getByCc(cc);
    }

    const result = await this.dynamoClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { cc },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(cc)',
        ReturnValues: 'ALL_NEW'
      })
    );

    if (!result.Attributes) {
      return null;
    }

    return UserItemMapper.toDomain(result.Attributes as IUserItem);
  }

  async delete(cc: string): Promise<void> {
    await this.dynamoClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { cc },
        ConditionExpression: 'attribute_exists(cc)'
      })
    );
  }
}