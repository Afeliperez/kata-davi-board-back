import { Router } from 'express';
import { UserController } from '@adapters/in/http/controllers/userController';

export const userRoutes = (userController: UserController): Router => {
  const userRouter = Router();

  userRouter.get('/', userController.listAll);
  userRouter.post('/login', userController.login);
  userRouter.post('/', userController.create);
  userRouter.put('/:cc', userController.update);
  userRouter.delete('/:cc', userController.delete);

  return userRouter;
};