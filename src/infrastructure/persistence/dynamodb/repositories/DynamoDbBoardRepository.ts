import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Board } from '../../../../domain/entities/Board';
import { BoardRepository } from '../../../../domain/repositories/BoardRepository';
import { BoardItem, BoardItemMapper } from '../mappers/BoardItemMapper';

export class DynamoDbBoardRepository implements BoardRepository {
  constructor(
    private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async findAll(): Promise<Board[]> {
    const result = await this.dynamoClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'sk = :boardSk',
        ExpressionAttributeValues: {
          ':boardSk': 'BOARD'
        }
      })
    );

    const items = (result.Items ?? []) as BoardItem[];

    return items.map((item) => BoardItemMapper.toDomain(item));
  }
}