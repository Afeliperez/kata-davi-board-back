import { Router } from 'express';
import { BoardController } from '../controllers/BoardController';

export const boardRoutes = (boardController: BoardController): Router => {
  const router = Router();

  router.get('/', boardController.list);

  return router;
};