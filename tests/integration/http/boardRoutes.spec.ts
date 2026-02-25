import request from 'supertest';
import { ListBoardsUseCase } from '../../../src/application/use-cases/ListBoardsUseCase';
import { BoardController } from '../../../src/infrastructure/http/controllers/BoardController';
import { InMemoryBoardRepository } from '../../../src/infrastructure/persistence/InMemoryBoardRepository';
import { createApp } from '../../../src/app';

describe('Board routes', () => {
  const boardRepository = new InMemoryBoardRepository();
  const listBoardsUseCase = new ListBoardsUseCase(boardRepository);
  const boardController = new BoardController(listBoardsUseCase);
  const app = createApp(boardController);

  it('GET /health returns unauthorized without token', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token requerido' });
  });

  it('GET /boards returns unauthorized without token', async () => {
    const response = await request(app).get('/boards');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token requerido' });
  });
});