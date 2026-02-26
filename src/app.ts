import express, { Express } from 'express';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';
import { UserController } from '@adapters/in/http/controllers/userController';
import { authMiddleware } from '@adapters/in/http/middlewares/authMiddleware';
import { errorHandler } from '@adapters/in/http/middlewares/errorHandler';
import { projectBoardRoutes } from '@adapters/in/http/routes/projectBoardRoutes';
import { userRoutes } from '@adapters/in/http/routes/userRoutes';
import { HttpConfig } from '@config/http';
import { EnvConfig } from '@config/env';

export interface IAppDependencies {
  projectBoardController?: ProjectBoardController;
  userController?: UserController;
}

export const createApp = (dependencies: IAppDependencies = {}): Express => {
  const { projectBoardController, userController } = dependencies;

  const app = express();
  const env = EnvConfig.get();
  const apiPath = `${env.apiPath}`;

  HttpConfig.getInstance().configure(app);
  app.use(authMiddleware);


  if (projectBoardController) {
    app.use(`/${apiPath}/project-boards`, projectBoardRoutes(projectBoardController));
  }

  if (userController) {
    app.use(`/${apiPath}/users`, userRoutes(userController));
  }

  app.use(errorHandler);

  return app;
};