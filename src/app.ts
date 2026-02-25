import express, { Express } from 'express';
import { BoardController } from './infrastructure/http/controllers/BoardController';
import { authMiddleware } from './infrastructure/http/middlewares/authMiddleware';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler';
import { boardRoutes } from './infrastructure/http/routes/boardRoutes';
import { userRoutes } from './infrastructure/http/routes/userRoutes';
import { HttpConfig } from './config/http';
import { EnvConfig } from './config/env';

export const createApp = (_boardController?: BoardController): Express => {
  void _boardController;

  const app = express();
  const env = EnvConfig.get();
  const apiPath = `${env.apiPath}`;

  HttpConfig.getInstance().configure(app);
  app.use(authMiddleware);

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  if (_boardController) {
    app.use('/boards', boardRoutes(_boardController));
  }

  app.use(`/${apiPath}/users`, userRoutes());

  app.use(errorHandler);

  return app;
};