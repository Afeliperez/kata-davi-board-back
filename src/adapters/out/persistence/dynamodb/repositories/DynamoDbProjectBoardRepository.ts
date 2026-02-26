import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import {
  IProjectBoard,
  IUpdateProjectBoard
} from '@domain/entities/ProjectBoard';
import { IProjectBoardRepository } from '@domain/repositories/projectBoardRepository';
import {
  IProjectBoardItem,
  ProjectBoardItemMapper
} from '@adapters/out/persistence/dynamodb/mappers/projectBoardItemMapper';
import { rethrowWithContext } from '@shared/errors/rethrowWithContext';

export class DynamoDbProjectBoardRepository implements IProjectBoardRepository {
  constructor(
    private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(projectBoard: IProjectBoard): Promise<void> {
    try {
      await this.dynamoClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: ProjectBoardItemMapper.toItem(projectBoard),
          ConditionExpression: 'attribute_not_exists(pro)'
        })
      );
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.create');
    }
  }

  async listAll(): Promise<IProjectBoard[]> {
    try {
      const result = await this.dynamoClient.send(
        new ScanCommand({
          TableName: this.tableName
        })
      );

      const items = (result.Items ?? []) as IProjectBoardItem[];

      return items.map((item) => ProjectBoardItemMapper.toDomain(item));
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.listAll');
    }
  }

  async listByAccessCode(accessCode: string): Promise<IProjectBoard[]> {
    try {
      const result = await this.dynamoClient.send(
        new ScanCommand({
          TableName: this.tableName,
          FilterExpression: 'contains(#accesos, :accessCode)',
          ExpressionAttributeNames: {
            '#accesos': 'accesos'
          },
          ExpressionAttributeValues: {
            ':accessCode': accessCode
          }
        })
      );

      const items = (result.Items ?? []) as IProjectBoardItem[];

      return items.map((item) => ProjectBoardItemMapper.toDomain(item));
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.listByAccessCode');
    }
  }

  async getByPro(pro: string): Promise<IProjectBoard | null> {
    try {
      const result = await this.dynamoClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { pro }
        })
      );

      if (!result.Item) {
        return null;
      }

      return ProjectBoardItemMapper.toDomain(result.Item as IProjectBoardItem);
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.getByPro');
    }
  }

  async update(pro: string, data: IUpdateProjectBoard): Promise<IProjectBoard | null> {
    try {
      const expressionParts: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};

      if (data.projectName !== undefined) {
        expressionParts.push('#projectName = :projectName');
        expressionAttributeNames['#projectName'] = 'project-name';
        expressionAttributeValues[':projectName'] = data.projectName;
      }

      if (data.hu !== undefined) {
        expressionParts.push('#hu = :hu');
        expressionAttributeNames['#hu'] = 'hu';
        expressionAttributeValues[':hu'] = data.hu;
      }

      if (data.accesos !== undefined) {
        expressionParts.push('#accesos = :accesos');
        expressionAttributeNames['#accesos'] = 'accesos';
        expressionAttributeValues[':accesos'] = data.accesos;
      }

      if (expressionParts.length === 0) {
        return this.getByPro(pro);
      }

      const result = await this.dynamoClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { pro },
          UpdateExpression: `SET ${expressionParts.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: 'attribute_exists(pro)',
          ReturnValues: 'ALL_NEW'
        })
      );

      if (!result.Attributes) {
        return null;
      }

      return ProjectBoardItemMapper.toDomain(result.Attributes as IProjectBoardItem);
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.update');
    }
  }

  async delete(pro: string): Promise<void> {
    try {
      await this.dynamoClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { pro },
          ConditionExpression: 'attribute_exists(pro)'
        })
      );
    } catch (error) {
      throw rethrowWithContext(error, 'DynamoDbProjectBoardRepository.delete');
    }
  }
}