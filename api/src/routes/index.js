import { Router } from 'express';
import UserController from '../app/controllers/UserController';
import SessionController from '../app/controllers/SessionController';
import Authmiddleware from '../app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(Authmiddleware);
routes.put('/users', UserController.update);

export default routes;
