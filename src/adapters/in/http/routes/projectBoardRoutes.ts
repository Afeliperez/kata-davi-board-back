import { Router } from 'express';
import { ProjectBoardController } from '@adapters/in/http/controllers/projectBoardController';

export const projectBoardRoutes = (projectBoardController: ProjectBoardController): Router => {
  const router = Router();

  router.post('/', projectBoardController.create);
  router.get('/', projectBoardController.listAll);
  router.get('/access/:accessCode', projectBoardController.listByAccessCode);
  router.get('/:pro', projectBoardController.getByPro);
  router.put('/:pro', projectBoardController.update);
  router.delete('/:pro', projectBoardController.delete);

  return router;
};