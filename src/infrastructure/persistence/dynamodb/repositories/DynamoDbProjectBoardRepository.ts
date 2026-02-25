import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import {
  ProjectBoard,
  UpdateProjectBoard
} from '../../../../domain/entities/ProjectBoard';
import { ProjectBoardRepository } from '../../../../domain/repositories/ProjectBoardRepository';
import { ProjectBoardItem, ProjectBoardItemMapper } from '../mappers/ProjectBoardItemMapper';

export class DynamoDbProjectBoardRepository implements ProjectBoardRepository {
  constructor(
    private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(projectBoard: ProjectBoard): Promise<void> {
    await this.dynamoClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: ProjectBoardItemMapper.toItem(projectBoard),
        ConditionExpression: 'attribute_not_exists(pro)'
      })
    );
  }

  async listAll(): Promise<ProjectBoard[]> {
    const result = await this.dynamoClient.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    const items = (result.Items ?? []) as ProjectBoardItem[];

    return items.map((item) => ProjectBoardItemMapper.toDomain(item));
  }

  async getByPro(pro: string): Promise<ProjectBoard | null> {
    const result = await this.dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pro }
      })
    );

    if (!result.Item) {
      return null;
    }

    return ProjectBoardItemMapper.toDomain(result.Item as ProjectBoardItem);
  }

  async update(pro: string, data: UpdateProjectBoard): Promise<ProjectBoard | null> {
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

    return ProjectBoardItemMapper.toDomain(result.Attributes as ProjectBoardItem);
  }

  async delete(pro: string): Promise<void> {
    await this.dynamoClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { pro },
        ConditionExpression: 'attribute_exists(pro)'
      })
    );
  }
}