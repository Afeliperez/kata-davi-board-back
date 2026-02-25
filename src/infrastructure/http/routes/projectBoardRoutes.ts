import { Router } from 'express';
import { getProjectBoardController } from '../controllers/ProjectBoardControllerProvider';

export const projectBoardRoutes = (): Router => {
  const router = Router();
  const projectBoardController = getProjectBoardController();

  router.post('/', projectBoardController.create);
  router.get('/', projectBoardController.listAll);
  router.get('/:pro', projectBoardController.getByPro);
  router.put('/:pro', projectBoardController.update);
  router.delete('/:pro', projectBoardController.delete);

  return router;
};