import { Router } from 'express';
import { getUserController } from '../controllers/UserControllerProvider';

export const userRoutes = (): Router => {
  const userRouter = Router();
  const userController = getUserController();

  userRouter.get('/', userController.listAll);
  userRouter.post('/login', userController.login);
  userRouter.post('/', userController.create);
  userRouter.put('/:cc', userController.update);
  userRouter.delete('/:cc', userController.delete);

  return userRouter;
};